FROM node:20-slim

# Install FFmpeg and yt-dlp
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    wget \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

RUN wget -q https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_linux \
    -O /usr/local/bin/yt-dlp && chmod +x /usr/local/bin/yt-dlp

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY server.js ./

ENV PORT=8080
CMD ["node", "server.js"]
