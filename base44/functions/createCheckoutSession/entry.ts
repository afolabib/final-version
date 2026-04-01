import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY');
const SITE_URL = 'https://freemi.app';

const PRICE_IDS = {
  starter: Deno.env.get('STRIPE_PRICE_STARTER'),
  pro: Deno.env.get('STRIPE_PRICE_BUSINESS'),
  max: Deno.env.get('STRIPE_PRICE_MAX'),
  business: Deno.env.get('STRIPE_PRICE_BUSINESS'),
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { plan, onboardingDataId, billing } = await req.json();

    if (!plan || !['starter', 'pro', 'max'].includes(plan)) {
      return Response.json({ error: 'Invalid plan. Must be: starter, pro, or max' }, { status: 400 });
    }

    const priceId = PRICE_IDS[plan];
    if (!priceId) {
      return Response.json({ error: `Price not configured for plan: ${plan}` }, { status: 500 });
    }

    // Create or get Stripe customer
    const listRes = await fetch(`https://api.stripe.com/v1/customers/search?query=email:'${encodeURIComponent(user.email)}'`, {
      headers: { 'Authorization': `Bearer ${STRIPE_SECRET_KEY}` },
    });
    const listData = await listRes.json();
    let customerId = listData.data?.[0]?.id;

    if (!customerId) {
      const createRes = await fetch('https://api.stripe.com/v1/customers', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          email: user.email,
          name: user.full_name || '',
          'metadata[base44UserId]': user.id,
        }),
      });
      const customer = await createRes.json();
      customerId = customer.id;
    }

    // Build checkout params
    const params = new URLSearchParams({
      'mode': 'subscription',
      'customer': customerId,
      'line_items[0][price]': priceId,
      'line_items[0][quantity]': '1',
      'success_url': `${SITE_URL}/dashboard?checkout=success`,
      'cancel_url': `${SITE_URL}/dashboard/wizard?checkout=canceled`,
      'metadata[userId]': user.id,
      'metadata[plan]': plan,
      'allow_promotion_codes': 'true',
    });

    if (onboardingDataId) {
      params.append('metadata[onboardingDataId]', onboardingDataId);
    }

    // Create checkout session
    const sessionRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    });

    if (!sessionRes.ok) {
      const error = await sessionRes.text();
      throw new Error(`Stripe error: ${error}`);
    }

    const session = await sessionRes.json();
    return Response.json({ url: session.url, sessionId: session.id });
  } catch (error) {
    console.error('Checkout error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});