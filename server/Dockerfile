# builder stage
FROM node:22-slim AS builder

# Install build dependencies required for mediasoup
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    gcc \
    libc6-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy dependencies first (cache layer)
COPY package*.json ./
RUN npm ci

# Copy source code (including generated prisma client)
COPY src ./src
COPY prisma ./prisma
COPY tsconfig.json ./

# Build TypeScript only (no prisma generate)
RUN npm run build

# Remove dev dependencies (shrinks prod image)
RUN npm ci --omit=dev



# runner stage
FROM node:22-slim AS runner

# ⭐ CRITICAL: Install mediasoup runtime dependencies
RUN apt-get update && apt-get install -y \
    ca-certificates \
    openssl \
    libssl3 \
    libc6 \
    libstdc++6 \
    libgcc-s1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy compiled app + prod deps
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

EXPOSE 8001

# ⭐ Add more verbose logging to see errors
CMD ["node", "dist/index.js"]