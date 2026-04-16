import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const { userId } = req.query;

  if (!userId) return res.status(400).json({ error: 'User ID required' });

  try {
    // Search for subscriptions with this userId in metadata
    const sessions = await stripe.checkout.sessions.list({
      limit: 10,
    });

    // Find active subscription for this user
    let isPremium = false;

    for (const session of sessions.data) {
      if (session.metadata?.userId === userId && session.payment_status === 'paid') {
        // Check if subscription is still active
        if (session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(session.subscription);
          if (subscription.status === 'active' || subscription.status === 'trialing') {
            isPremium = true;
            break;
          }
        }
      }
    }

    res.status(200).json({ isPremium });
  } catch (e) {
    console.error('Subscription check error:', e.message);
    res.status(500).json({ isPremium: false });
  }
}
