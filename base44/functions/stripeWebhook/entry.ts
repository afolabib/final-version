import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import Stripe from 'npm:stripe@17.7.0';

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY');
const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET');

const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2024-12-18.acacia' });

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    let event;
    if (STRIPE_WEBHOOK_SECRET && signature) {
      event = await stripe.webhooks.constructEventAsync(body, signature, STRIPE_WEBHOOK_SECRET);
    } else {
      event = JSON.parse(body);
    }

    console.log('Stripe event:', event.type);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata?.userId;
        const onboardingDataId = session.metadata?.onboardingDataId;

        if (!userId) {
          console.error('No userId in checkout metadata');
          break;
        }

        console.log('Checkout completed for user:', userId);

        // Mark onboarding data as paid
        if (onboardingDataId) {
          await base44.asServiceRole.entities.OnboardingData.update(onboardingDataId, {
            status: 'paid',
          });
        }

        // Auto-provision the instance
        try {
          const provisionRes = await base44.asServiceRole.functions.invoke('provisionCustomerInstance', {
            userId,
            onboardingDataId,
          });
          console.log('Auto-provisioned instance:', provisionRes);
        } catch (err) {
          console.error('Auto-provision failed:', err.message);
        }

        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const userId = subscription.metadata?.userId;
        if (!userId) break;

        console.log('Subscription canceled for user:', userId);

        // Find user instances and stop them
        const instances = await base44.asServiceRole.entities.CustomerInstance.filter({
          customerId: userId,
          status: 'active',
        });

        for (const instance of instances) {
          try {
            await base44.asServiceRole.functions.invoke('manageInstance', {
              instanceId: instance.id,
              action: 'stop',
            });
          } catch (err) {
            console.error('Failed to stop instance:', instance.id, err.message);
          }
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        console.log('Payment failed for invoice:', invoice.id);
        break;
      }

      default:
        console.log('Unhandled event:', event.type);
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});