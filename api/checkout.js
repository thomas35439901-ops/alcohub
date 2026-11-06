import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { planType, userId, userEmail } = req.body;

    if (!userId || !planType) {
      return res.status(400).json({ error: '缺少必要的 userId 或 planType' });
    }

    // 根據方案對應價格 ID
    let priceId = '';
    if (planType === '24h') {
      priceId = process.env.STRIPE_PRICE_24H;
    } else if (planType === 'lifetime') {
      priceId = process.env.STRIPE_PRICE_LIFETIME;
    } else {
      return res.status(400).json({ error: '無效的 planType' });
    }

    const siteUrl = process.env.VITE_SITE_URL || 'https://alcohub.vercel.app';

    // 建立 Stripe Checkout 結帳 Session（由 Stripe 後台自動動態適配付款方式）
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      customer_email: userEmail || undefined,
      client_reference_id: userId,
      metadata: {
        userId: userId,
        planType: planType,
      },
      success_url: `${siteUrl}?payment=success`,
      cancel_url: `${siteUrl}?payment=cancelled`,
    });

    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Stripe Checkout Error:', error);
    return res.status(500).json({ error: error.message });
  }
}