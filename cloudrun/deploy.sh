#!/usr/bin/env bash
# ── Deploy Freemi Renderer to Cloud Run ──────────────────────────────────────
# Run once from this directory: bash deploy.sh
# Requires: gcloud CLI authenticated, project set to freemi-3f7c7

set -e

PROJECT="freemi-3f7c7"
REGION="us-central1"
SERVICE="freemi-renderer"
SECRET="freemi-render-$(openssl rand -hex 8)"

echo "🏗  Building and deploying Cloud Run service: $SERVICE"
echo "   Project: $PROJECT  |  Region: $REGION"
echo ""

gcloud run deploy "$SERVICE" \
  --source . \
  --platform managed \
  --region "$REGION" \
  --memory 2Gi \
  --cpu 2 \
  --timeout 600s \
  --allow-unauthenticated \
  --project "$PROJECT" \
  --set-env-vars "RENDER_SECRET=$SECRET"

echo ""
echo "✅ Deployed!"
echo ""

# Get the service URL
SERVICE_URL=$(gcloud run services describe "$SERVICE" \
  --platform managed \
  --region "$REGION" \
  --project "$PROJECT" \
  --format "value(status.url)")

echo "🌐 Service URL: $SERVICE_URL"
echo "🔑 Render Secret: $SECRET"
echo ""
echo "📋 Next steps:"
echo "   1. Copy this URL into src/lib/clipsExport.js:"
echo "      export const RENDERER_URL = '${SERVICE_URL}';"
echo "   2. Copy the secret into the same file:"
echo "      export const RENDER_SECRET = '${SECRET}';"
echo ""

# Grant the renderer access to Firebase Storage and Firestore
echo "🔐 Granting Storage and Firestore access to Cloud Run service account..."
SA=$(gcloud run services describe "$SERVICE" \
  --platform managed \
  --region "$REGION" \
  --project "$PROJECT" \
  --format "value(spec.template.spec.serviceAccountName)")

if [ -n "$SA" ]; then
  gcloud projects add-iam-policy-binding "$PROJECT" \
    --member "serviceAccount:$SA" \
    --role "roles/storage.objectAdmin" --quiet

  gcloud projects add-iam-policy-binding "$PROJECT" \
    --member "serviceAccount:$SA" \
    --role "roles/datastore.user" --quiet
  echo "✅ IAM roles granted to $SA"
fi
