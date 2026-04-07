# ─────────────────────────────────────────────────────────────────────────────
# Stage 1 — TypeScript build
# ─────────────────────────────────────────────────────────────────────────────
FROM node:20-bullseye-slim AS builder

WORKDIR /app
COPY package*.json tsconfig.json ./
RUN npm install
COPY src/ ./src/
RUN npm run build

# ─────────────────────────────────────────────────────────────────────────────
# Stage 2 — Runtime
#
# Debian 11 Bullseye — stable package names, no Bookworm t64 renames.
# Desktop stack: Xvfb + Openbox + x11vnc + noVNC + nginx + supervisord
# Browser:       Playwright Chromium (managed, correct version)
# Agent:         Freemi Node.js runtime
# ─────────────────────────────────────────────────────────────────────────────
FROM node:20-bullseye

ENV DEBIAN_FRONTEND=noninteractive

# ── Desktop + VNC stack ───────────────────────────────────────────────────────
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

# ── App deps ──────────────────────────────────────────────────────────────────
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev

# ── Playwright Chromium ───────────────────────────────────────────────────────
# Install chromium + all its system deps in one step.
# --with-deps runs apt internally and handles all Bullseye deps automatically.
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
RUN npx playwright install chromium --with-deps

COPY --from=builder /app/dist ./dist

# ── Config files ──────────────────────────────────────────────────────────────
COPY supervisord.conf /etc/supervisor/conf.d/freemi.conf
COPY nginx.conf       /etc/nginx/nginx.conf
COPY start.sh         /start.sh
RUN chmod +x /start.sh

RUN mkdir -p /root/.config/openbox
COPY openbox-autostart /root/.config/openbox/autostart
RUN chmod +x /root/.config/openbox/autostart

RUN ln -sf /usr/share/novnc/vnc.html /usr/share/novnc/index.html 2>/dev/null || true

# ── Environment ───────────────────────────────────────────────────────────────
VOLUME /data

ENV NODE_ENV=production \
    DISPLAY=:99 \
    PORT=8080

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -sf http://localhost/health || exit 1

CMD ["/start.sh"]
