#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# Freemi Agent Runtime — container entrypoint
# Runs before supervisord starts any processes.
# ─────────────────────────────────────────────────────────────────────────────
set -e

# ── 1. Ensure data directories exist ─────────────────────────────────────────
mkdir -p /data/logs /data/workspace

# ── 2. Seed Felix workspace files from FELIX_WORKSPACE_JSON ──────────────────
# provisionInstance.ts base64-encodes the generated workspace files and passes
# them as an env var. We write them to /data/workspace/ so the agent can read
# its SOUL.md, IDENTITY.md, HEARTBEAT.md, BOOTSTRAP.md on startup.
if [ -n "$FELIX_WORKSPACE_JSON" ]; then
  node -e "
    const fs   = require('fs');
    const path = require('path');
    try {
      const files = JSON.parse(Buffer.from(process.env.FELIX_WORKSPACE_JSON, 'base64').toString('utf8'));
      const wsDir = '/data/workspace';
      fs.mkdirSync(wsDir, { recursive: true });
      for (const f of files) {
        const safe = (f.path || '').replace(/[^a-zA-Z0-9._-]/g, '');
        if (safe) {
          fs.writeFileSync(path.join(wsDir, safe), f.content, 'utf8');
          console.log('[freemi] seeded', safe);
        }
      }
      console.log('[freemi] Felix workspace ready —', files.length, 'files');
    } catch (e) {
      console.error('[freemi] Felix seed error:', e.message);
    }
  " || true
fi

# ── 3. Create VNC password from OPENCLAW_GATEWAY_TOKEN ───────────────────────
# Same token the dashboard uses to auth with the runtime API.
VNC_PASS="${OPENCLAW_GATEWAY_TOKEN:-freemi-default}"
x11vnc -storepasswd "$VNC_PASS" /data/.vncpass 2>/dev/null || true
echo "[freemi] VNC password stored"

# ── 4. Create nginx pid directory ─────────────────────────────────────────────
mkdir -p /run
touch /run/nginx.pid

# ── 5. Start all services via supervisord ────────────────────────────────────
echo "[freemi] Starting supervisord..."
exec supervisord -c /etc/supervisor/conf.d/freemi.conf
