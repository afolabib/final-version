import * as functions from 'firebase-functions';
import Stripe from 'stripe';
import { db } from './firebase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

const PRICE_IDS: Record<string, string> = {
  starter: process.env.STRIPE_PRICE_STARTER || '',
  pro: process.env.STRIPE_PRICE_PRO || '',
  max: process.env.STRIPE_PRICE_MAX || '',
};

export const createCheckout = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { plan, onboardingSessionId, agentType } = data;

  if (!plan || !PRICE_IDS[plan]) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid plan');
  }

  const priceId = PRICE_IDS[plan];

  try {
    // Get or create Stripe customer
    const usersRef = db.collection('users').doc(context.auth.uid);
    const userDoc = await usersRef.get();
    let customerId = userDoc.data()?.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: context.auth.token.email,
        metadata: { firebaseUid: context.auth.uid },
      });
      customerId = customer.id;
      await usersRef.set({ stripeCustomerId: customerId }, { merge: true });
    }

    if (onboardingSessionId) {
      await db.collection('onboarding_sessions').doc(onboardingSessionId).set({
        userId: context.auth.uid,
        plan,
        agentType: agentType || null,
        status: 'checkout_created',
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.SITE_URL || 'https://freemi.ai'}/dashboard/wizard?checkout=success&session=${onboardingSessionId || ''}`,
      cancel_url: `${process.env.SITE_URL || 'https://freemi.ai'}/dashboard/wizard?checkout=canceled&session=${onboardingSessionId || ''}`,
      metadata: {
        userId: context.auth.uid,
        plan,
        onboardingSessionId: onboardingSessionId || '',
        agentType: agentType || '',
      },
    });

    return {
      url: session.url,
      checkoutSessionId: session.id,
      onboardingSessionId: onboardingSessionId || null,
    };
  } catch (error) {
    console.error('Checkout error:', error);
    throw new functions.https.HttpsError('internal', 'Failed to create checkout session');
  }
});
