# ─────────────────────────────────────────────────────────────────────────────
# Stage 1 — TypeScript build
# ─────────────────────────────────────────────────────────────────────────────
FROM node:20-bookworm-slim AS builder

WORKDIR /app
COPY package*.json tsconfig.json ./
RUN npm install
COPY src/ ./src/
RUN npm run build

# ─────────────────────────────────────────────────────────────────────────────
# Stage 2 — Runtime: agent brain + full desktop screen stack
#
# Architecture:
#   supervisord manages:
#     • Xvfb        — virtual display :99 (1280×800 24-bit)
#     • Openbox     — window manager (proper window decorations)
#     • x11vnc      — captures :99, serves VNC on localhost:5900
#     • websockify  — proxies VNC to WebSocket on localhost:6080
#     • nginx       — public port 80:
#                        /screen/  → noVNC viewer  (6080)
#                        /         → agent runtime (8080)
#     • agent       — Freemi Node.js runtime (heartbeats, tasks, tools)
#
# The agent's Playwright browser launches headful on DISPLAY=:99 so every
# page navigation, click and form fill is visible live via the Screen panel.
# ─────────────────────────────────────────────────────────────────────────────
FROM node:20-bookworm AS runtime

# ── System packages ───────────────────────────────────────────────────────────
# Install desktop + VNC stack. Chrome system deps are handled by
# `playwright install-deps` below — no need to list them manually
# (avoids Debian Bookworm t64 rename issues like libasound2 → libasound2t64).
RUN apt-get update && apt-get install -y --no-install-recommends \
    xvfb \
    x11vnc \
    openbox \
    novnc \
    websockify \
    nginx \
    supervisor \
    xterm \
    fonts-liberation \
    fonts-noto \
    scrot \
    xdotool \
    curl \
    procps \
    ca-certificates \
    gnupg \
    && rm -rf /var/lib/apt/lists/*

# ── Node deps (production) ────────────────────────────────────────────────────
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev

# ── Playwright + managed Chromium ─────────────────────────────────────────────
# `install chromium --with-deps` downloads the browser binary AND installs
# all system dependencies in one step (handles Bookworm package renames).
RUN npm install playwright
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
RUN npx playwright install chromium --with-deps

# ── Copy compiled runtime ─────────────────────────────────────────────────────
COPY --from=builder /app/dist ./dist

# ── Runtime config files ──────────────────────────────────────────────────────
COPY supervisord.conf /etc/supervisor/conf.d/freemi.conf
COPY nginx.conf       /etc/nginx/nginx.conf
COPY start.sh         /start.sh
RUN chmod +x /start.sh

# Openbox config dir
RUN mkdir -p /root/.config/openbox
COPY openbox-autostart /root/.config/openbox/autostart
RUN chmod +x /root/.config/openbox/autostart

# noVNC: serve vnc.html as default index
RUN ln -sf /usr/share/novnc/vnc.html /usr/share/novnc/index.html 2>/dev/null || true

# ── Persistent volume for agent workspace + logs ──────────────────────────────
VOLUME /data

# ── Environment ───────────────────────────────────────────────────────────────
ENV NODE_ENV=production \
    DISPLAY=:99 \
    PORT=8080

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -sf http://localhost/health || exit 1

CMD ["/start.sh"]
