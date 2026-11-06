import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// 後端使用最高權限 service_role key 更新資料庫
const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// 關閉 Vercel 預設的 Body Parser，保留 Raw Buffer 供 Stripe 驗證簽名
export const config = {
  api: {
    bodyParser: false,
  },
};

async function buffer(readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const buf = await buffer(req);
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err) {
    console.error(`Webhook Signature 驗證失敗: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // 監聽付款完成事件
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = session.client_reference_id || session.metadata?.userId;
    const planType = session.metadata?.planType;

    if (userId) {
      let updatePayload = {
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

      const { error } = await supabaseAdmin
        .from('profiles')
        .update(updatePayload)
        .eq('id', userId);

      if (error) {
        console.error('更新 Supabase profiles 失敗:', error);
        return res.status(500).json({ error: '更新權限失敗' });
      }

      console.log(`成功開通用戶 ${userId} 的 ${planType} 權限`);
    }
  }

  return res.status(200).json({ received: true });
}