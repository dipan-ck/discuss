# =========================
# 1️⃣ Builder Stage
# =========================
FROM node:22-slim AS builder

# Install build tools (needed for mediasoup native compilation)
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    gcc \
    libc6-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy only package files first (better caching)
COPY package*.json ./

# Install ALL deps (including dev)
RUN npm ci

# Copy rest of project
COPY tsconfig.json ./
COPY prisma ./prisma
COPY src ./src

# Generate Prisma client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# Remove dev dependencies (cleaner than reinstall)
RUN npm prune --omit=dev

# =========================
# 2️⃣ Runtime Stage
# =========================
FROM node:22-slim AS runner

# Install runtime libraries required by mediasoup
RUN apt-get update && apt-get install -y \
    ca-certificates \
    openssl \
    libssl3 \
    libc6 \
    libstdc++6 \
    libgcc-s1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy production node_modules + built app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY package*.json ./

EXPOSE 8001

ENV NODE_ENV=production

CMD ["node", "dist/index.js"]

# docker build -t dipan2003/discuss-server:latest .
