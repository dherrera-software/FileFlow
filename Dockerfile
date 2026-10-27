FROM node:20-bookworm-slim

# Install system dependencies: LibreOffice, FFmpeg, and essential fonts for headless document rendering
RUN apt-get update && apt-get install -y --no-install-recommends \
    libreoffice \
    libreoffice-writer \
    libreoffice-calc \
    fonts-liberation \
    fonts-dejavu-core \
    ffmpeg \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Activate pnpm using Corepack
RUN corepack enable && corepack prepare pnpm@10.31.0 --activate

WORKDIR /app

# Copy pnpm workspace manifests
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY server/package.json ./server/
COPY client/package.json ./client/

# Install dependencies for the workspace
RUN pnpm install

# Copy backend source code
COPY server/ ./server/

# Build backend TypeScript
RUN pnpm --filter fileflow-server build

# Switch to server directory
WORKDIR /app/server

EXPOSE 10000

ENV NODE_ENV=production
ENV PORT=10000

CMD ["node", "dist/server.js"]
