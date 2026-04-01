# freemi.ai → Fly.io → OpenClaw Setup Plan

## Executive Summary

freemi.ai should be the control plane and dashboard.
Fly.io should run the actual customer OpenClaw runtimes.
Firebase/Firestore should be the backend source of truth for onboarding, billing, provisioning, lifecycle state, and channel configuration.

Today, the frontend is ahead of the backend, but the current implementation is split between Base44 patterns and early Firebase provisioning code. Before real deployment can work reliably, the architecture needs to be unified.

---

## Current State of the Codebase

### Frontend
The freemi.ai dashboard already contains:
- onboarding wizard UI
- payment step UI
- deploy/loading/success UI
- instances dashboard UI
- integrations UI
- inbox/tasks/dashboard surfaces

Key files:
- `src/pages/dashboard/Wizard.jsx`
- `src/components/dashboard/OnboardingWizard.jsx`
- `src/components/dashboard/PaymentStep.jsx`
- `src/components/dashboard/InstancesView.jsx`
- `src/components/dashboard/SetupLoadingStep.jsx`
- `src/components/dashboard/DeploySuccessStep.jsx`

### Problem in the frontend today
The frontend still assumes Base44 is the backend source of truth.

It currently uses:
- `base44.entities.OnboardingData.create(...)`
- `base44.entities.CustomerInstance.list(...)`
- `base44.functions.invoke('createCheckoutSession', ...)`
- `base44.functions.invoke('manageInstance', ...)`
- `base44.functions.invoke('checkInstanceStatus', ...)`

That does not match the desired architecture.

### Firebase Functions
The repo currently contains early provisioning code:
- `functions/src/createCheckout.ts`
- `functions/src/provisionInstance.ts`
- `functions/src/stripeWebhook.ts`

These are the right direction, but not production-ready.

---

## Critical Issues in the Current Backend

1. `admin.initializeApp()` is called in multiple files.
   - This must be centralized.

2. No proper Firebase functions entrypoint is visible.
   - Need `functions/src/index.ts` exporting all functions.

3. Stripe webhook does not verify signatures.
   - Unsafe for production.

4. Pricing is inconsistent.
   - UI uses `starter`, `pro`, `max`
   - Firebase code expects `starter`, `business`

5. Frontend is not calling Firebase yet.
   - It still uses Base44 entities/functions.

6. Fly.io provisioning is infrastructure-only.
   - It creates a machine, but does not generate a real customer-specific OpenClaw workspace.

7. No real health/status pipeline exists.
   - No robust active/unhealthy/failed lifecycle.

8. No real subscription cancel cleanup.
   - Placeholder only.

9. No secure secret handling model exists.
   - Telegram / WhatsApp / OpenRouter / Twilio secrets need encrypted storage and controlled injection.

10. Runtime bootstrap is incomplete.
   - Starting a machine is not the same as provisioning a usable OpenClaw operator.

---

## Target Architecture

### freemi.ai responsibilities
- onboarding
- auth
- billing
- instance management
- status visibility
- channel connection UI
- later: inbox/task/chat visibility

### Firebase / Firestore responsibilities
- source of truth for users, onboarding, subscriptions, instances, secrets, channels, logs
- Stripe checkout/session creation
- Stripe webhook processing
- Fly.io machine lifecycle orchestration
- status sync and recovery flows

### Fly.io responsibilities
- one OpenClaw runtime per customer
- attached persistent volume
- seeded workspace/config
- connected channels
- actual operator execution

### OpenClaw responsibilities
- channel handling
- memory
- task execution
- workflows
- agent behavior

---

## Firestore Data Model

### `users/{uid}`
Fields:
- `email`
- `displayName`
- `stripeCustomerId`
- `createdAt`
- `updatedAt`

### `onboarding_sessions/{id}`
Fields:
- `userId`
- `businessName`
- `industry`
- `idealCustomer`
- `priorities[]`
- `tone`
- `products`
- `customInstructions`
- `plan`
- `status` = `draft | checkout_created | paid | provisioning | provisioned | failed`
- `selectedChannels[]`
- `createdAt`
- `updatedAt`

### `instances/{id}`
Fields:
- `userId`
- `onboardingSessionId`
- `plan`
- `status` = `pending | provisioning | active | unhealthy | paused | failed | deleting | deleted`
- `machineId`
- `volumeId`
- `flyApp`
- `region`
- `subdomain`
- `internalUrl`
- `customDomain`
- `workspaceVersion`
- `lastHealthCheckAt`
- `lastKnownHealth`
- `createdAt`
- `updatedAt`

### `instance_secrets/{instanceId}`
Encrypted secret payload only:
- `telegramBotToken`
- `openrouterApiKey`
- `whatsappAccessToken`
- `twilioAuthToken`
- etc.

### `subscriptions/{id}`
Fields:
- `userId`
- `stripeCustomerId`
- `stripeSubscriptionId`
- `stripeCheckoutSessionId`
- `plan`
- `status`
- `currentPeriodEnd`
- `createdAt`
- `updatedAt`

### `channels/{id}`
Fields:
- `instanceId`
- `type`
- `status`
- `displayName`
- `lastVerifiedAt`
- `configSummary`

### `instance_events/{id}`
Append-only event log:
- `instanceId`
- `type`
- `message`
- `payload`
- `createdAt`

---

## Required Backend Refactor

Create these modules:
- `functions/src/index.ts`
- `functions/src/firebase.ts`
- `functions/src/stripe.ts`
- `functions/src/fly.ts`
- `functions/src/openclaw-config.ts`
- `functions/src/createCheckout.ts`
- `functions/src/stripeWebhook.ts`
- `functions/src/provisionInstance.ts`
- `functions/src/manageInstance.ts`
- `functions/src/checkInstanceStatus.ts`

### Shared Firebase init
Use one shared module:

```ts
import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp();
}

export { admin };
export const db = admin.firestore();
```

### Required exports
Example `index.ts`:

```ts
export { createCheckout } from './createCheckout';
export { stripeWebhook } from './stripeWebhook';
export { provisionInstance } from './provisionInstance';
export { manageInstance } from './manageInstance';
export { checkInstanceStatus } from './checkInstanceStatus';
```

---

## Billing and Checkout Plan

### Unify plan model
Canonical plans should be:
- `starter`
- `pro`
- `max`

Stripe env vars:
- `STRIPE_PRICE_STARTER`
- `STRIPE_PRICE_PRO`
- `STRIPE_PRICE_MAX`

### New checkout flow
1. User completes onboarding in freemi.ai.
2. Frontend saves onboarding draft to Firestore.
3. Frontend calls Firebase callable `createCheckout`.
4. Firebase creates Stripe Checkout Session.
5. Stripe redirects user to success page.
6. Webhook drives provisioning.

### Webhook responsibilities
On `checkout.session.completed`:
1. verify Stripe signature
2. extract `userId`, `onboardingSessionId`, `plan`
3. mark onboarding session as `paid`
4. create/update subscription record
5. create instance record in `provisioning`
6. provision Fly machine
7. seed OpenClaw workspace
8. verify health
9. mark instance `active`

If failure occurs:
- mark instance as `failed`
- write event log entries
- keep debugging context available

---

## Fly.io Provisioning Plan

### Fly topology
Recommended:
- one shared Fly app
- one machine per customer

This is simpler and easier to operate than one Fly app per customer.

### Machine sizing by plan
- Starter: 512MB–1GB
- Pro: 1GB
- Max: 2GB+

### Machine metadata
Each machine should carry:
- `user_id`
- `instance_id`
- `plan`
- `platform=freemi`

### Volume strategy
Each machine gets a persistent volume.
That volume stores:
- workspace files
- memory
- local state
- generated config

### Runtime URL
Customer should **not** use the raw Fly URL.
Store it only as an internal runtime URL.
freemi.ai remains the user-facing product surface.

---

## OpenClaw Workspace Generation Plan

This is the most important missing piece.

Provisioning must generate a customer-specific workspace, not just start a container.

### Files to generate per customer
- `IDENTITY.md`
- `SOUL.md`
- `USER.md`
- `MEMORY.md`
- `AGENTS.md`
- `HEARTBEAT.md`
- optional `CHANNELS.md`
- optional `BUSINESS_CONTEXT.md`

### Source inputs
Generated from onboarding:
- business name
- industry
- ideal customer
- priorities
- tone
- products/services
- custom instructions
- plan
- chosen channels

### `SOUL.md` generation
This should define:
- operator persona
- response style
- business goals
- priorities
- escalation rules
- channel behavior
- autonomy boundaries

### Config generation
Need a real OpenClaw config/env model for:
- model selection
- enabled channels
- secrets
- plugin settings
- cron behavior
- memory settings

### Secret injection
Do not store raw secrets in visible docs.
Use encrypted Firestore storage and inject only the required secrets into the machine env/config.

---

## Provisioning Lifecycle

Provisioning should be multi-step and explicit.

### Canonical provisioning states
- `draft`
- `awaiting_payment`
- `payment_confirmed`
- `provisioning_machine`
- `seeding_workspace`
- `starting_openclaw`
- `verifying_health`
- `active`
- `failed`

### Actual provisioning sequence
1. create instance record
2. create Fly volume
3. create Fly machine
4. write generated workspace/config to mounted volume
5. inject model + secrets
6. start/restart OpenClaw
7. verify `/health`
8. verify boot completed
9. mark active

### Required event log entries
- `checkout_completed`
- `volume_created`
- `machine_created`
- `workspace_seeded`
- `health_check_passed`
- `agent_activated`
- `activation_failed`

---

## Frontend Refactor Plan

### Remove Base44 backend dependency for provisioning
Stop using:
- `base44.entities.OnboardingData`
- `base44.entities.CustomerInstance`
- `base44.functions.invoke('createCheckoutSession')`
- `base44.functions.invoke('manageInstance')`
- `base44.functions.invoke('checkInstanceStatus')`

### Replace with Firebase-backed flows
Frontend should use:
- Firebase Auth
- Firestore reads for onboarding/instances/status
- Firebase callable functions for checkout and instance management

### Components needing refactor first
1. `OnboardingWizard.jsx`
2. `PaymentStep.jsx`
3. `InstancesView.jsx`
4. `SetupLoadingStep.jsx`
5. `DeploySuccessStep.jsx`

### Fake UI to replace with real lifecycle
#### `SetupLoadingStep.jsx`
Currently simulated.
Should instead display real provisioning status from Firestore.

#### `DeploySuccessStep.jsx`
Should only show success when the instance is truly healthy and marked `active`.

#### `InstancesView.jsx`
Should read Firestore-backed instance data and use Firebase callable actions.

---

## Channel Connection Plan

### Do not overload first-time onboarding
Best approach:
- first deploy the agent
- then connect channels after provisioning

### Telegram first
Implement first because it is the fastest real channel:
- token input UI
- encrypted storage
- machine reconfigure/restart
- validation check

### WhatsApp second
More complex and should follow after Telegram.
Need provider-specific connection flow and status verification.

### Channel model
Store each channel connection in Firestore with status:
- `disconnected`
- `connecting`
- `connected`
- `failed`

---

## Inbox / Chat / Task Visibility Strategy

Since users should not visit the raw agent URL, freemi.ai must eventually become the visibility layer.

### Recommended approach
Do **not** try to rebuild full chat sync on day one.

### Near-term dashboard scope
Show:
- provisioning status
- instance state
- connected channels
- recent events
- deployment logs

### Later scope
Mirror from OpenClaw into Firestore:
- conversations
- recent messages
- tasks
- execution logs

Then render inbox/tasks/chat surfaces inside freemi.ai.

---

## Operational Safety Requirements

### Idempotency
Stripe retries must not create duplicate machines.
Use:
- Stripe event ID log
- onboardingSession lock
- instance provisioning lock

### Recovery handling
Need recovery logic for partial failures:
- volume created, machine failed
- machine created, seeding failed
- webhook replay after partial completion

### Subscription cancellation
On `customer.subscription.deleted`:
- locate instance
- mark deleting
- stop machine
- destroy machine
- clean up volume if policy allows
- mark instance deleted
- preserve event history

---

## Recommended Build Order

## Sprint 1 — Real provisioning foundation
1. fix Firebase functions structure
2. centralize admin init
3. add index exports
4. unify pricing model
5. move onboarding save to Firestore
6. switch checkout to Firebase callable
7. implement verified Stripe webhook
8. create instance records on payment
9. create Fly machine + volume
10. show real instance status in dashboard

## Sprint 2 — Real OpenClaw bootstrap
11. generate customer workspace files
12. seed mounted volume
13. inject secrets/model config
14. add health checks
15. add start/stop/delete/restart actions
16. add instance event log

## Sprint 3 — Channels
17. Telegram connection flow
18. Firestore channel model
19. restart/reconfigure on updates
20. connection verification UI

## Sprint 4 — Visibility
21. replace fake deploy states with real ones
22. real instances page from Firestore
23. event/deployment logs UI
24. optional message/task mirroring

---

## Immediate Recommendation

If execution starts now, the first things to change should be:

1. remove Base44 as the provisioning backend source of truth
2. switch frontend onboarding + checkout to Firebase
3. repair Firebase function structure and exports
4. unify plans and Stripe mapping
5. build real OpenClaw workspace generation

That is the shortest path from “nice dashboard UI” to “real paid customer gets a real operator on Fly.io.”

---

## Final Architecture Statement

freemi.ai should be the Firebase-backed control plane and dashboard, while each paid customer gets a dedicated Fly.io OpenClaw runtime seeded from onboarding data and managed entirely from the freemi.ai dashboard.
