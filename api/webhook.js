import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// 注意：必須使用 SUPABASE_SERVICE_ROLE_KEY 才能在後端繞過 RLS 寫入
const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export const config = {
  api: {
    bodyParser: false,
  },
};

async function getRawBody(readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    const rawBody = await getRawBody(req);
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = session.metadata?.userId || session.client_reference_id;
    const planType = session.metadata?.planType;

    if (!userId) {
      return res.status(400).json({ error: '缺少 userId' });
    }

    let updatePayload = {
      id: userId,
      is_pro: true,
      tier: planType === 'lifetime' ? 'lifetime' : 'pass_24h',
      updated_at: new Date().toISOString(),
    };

    if (planType === '24h') {
      const expireTime = new Date(Date.now() + 24 * 60 * 60 * 1000);
      updatePayload.expires_at = expireTime.toISOString();
    } else {
      updatePayload.expires_at = null;
    }

    // 使用 upsert：若找不到該使用者資料則直接建立
    const { error } = await supabaseAdmin
      .from('profiles')
      .upsert(updatePayload);

    if (error) {
      console.error('Supabase update error:', error);
      // 將真實錯誤原因回傳給 Stripe
      return res.status(500).json({ 
        error: '更新權限失敗', 
        supabase_error: error.message,
        details: error
      });
    }
  }

  return res.status(200).json({ received: true });
}