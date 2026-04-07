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
# Stage 2 — Runtime
#
# Uses the official Microsoft Playwright image as the base.
# It ships with:
#   • Ubuntu 22.04 (Jammy) — stable package names, no Bookworm t64 renames
#   • Node.js 20
#   • Playwright Chromium pre-installed + all system deps
#
# We layer on top:
#   • Xvfb          — virtual display :99
#   • Openbox       — window manager (visible window frames)
#   • x11vnc        — VNC server capturing :99 → localhost:5900
#   • noVNC         — WebSocket → browser VNC viewer
#   • nginx         — /screen/ → noVNC (6080), / → agent runtime (8080)
#   • supervisord   — manages all processes
#   • xterm         — terminal showing live agent logs on the desktop
# ─────────────────────────────────────────────────────────────────────────────
FROM mcr.microsoft.com/playwright:v1.44.0-jammy AS runtime

# Silence interactive prompts
ENV DEBIAN_FRONTEND=noninteractive

# ── Desktop + VNC + reverse proxy stack ──────────────────────────────────────
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
    scrot \
    xdotool \
    curl \
    procps \
    && rm -rf /var/lib/apt/lists/*

# ── App ───────────────────────────────────────────────────────────────────────
WORKDIR /app
COPY package*.json ./
# Playwright is already installed in the base image; skip its install scripts
RUN npm install --omit=dev --ignore-scripts

COPY --from=builder /app/dist ./dist

# ── Config files ──────────────────────────────────────────────────────────────
COPY supervisord.conf /etc/supervisor/conf.d/freemi.conf
COPY nginx.conf       /etc/nginx/nginx.conf
COPY start.sh         /start.sh
RUN chmod +x /start.sh

RUN mkdir -p /root/.config/openbox
COPY openbox-autostart /root/.config/openbox/autostart
RUN chmod +x /root/.config/openbox/autostart

# noVNC default page
RUN ln -sf /usr/share/novnc/vnc.html /usr/share/novnc/index.html 2>/dev/null || true

# ── Environment ───────────────────────────────────────────────────────────────
VOLUME /data

ENV NODE_ENV=production \
    DISPLAY=:99 \
    PORT=8080 \
    # Point to playwright's managed browser (already in the base image)
    PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -sf http://localhost/health || exit 1

CMD ["/start.sh"]
