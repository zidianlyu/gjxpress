# =============================================================================
# GJXpress Backend Dockerfile
# Multi-stage build for optimized production image
# =============================================================================

# -----------------------------------------------------------------------------
# Stage 1: Builder
# -----------------------------------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma
RUN npx prisma generate

COPY tsconfig*.json nest-cli.json ./
COPY src ./src

RUN npm run build

# Debug: verify dist output
RUN echo "=== dist output ===" && find dist -maxdepth 3 -type f | head -20

# Prune to production dependencies (keeps generated prisma client)
RUN npm prune --omit=dev

# -----------------------------------------------------------------------------
# Stage 2: Runner (Production)
# -----------------------------------------------------------------------------
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
# Prisma engine auto-detection works after binaryTargets are set in schema.prisma

RUN apk add --no-cache dumb-init openssl

COPY package*.json ./

# Copy pruned production node_modules (includes correct prisma binaries)
COPY --from=builder /app/node_modules ./node_modules

# Built application
COPY --from=builder /app/dist ./dist

# Prisma schema (for migrations)
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

ENTRYPOINT ["dumb-init", "--"]

# Entry point: nest build outputs to dist/src/main.js
CMD ["node", "dist/src/main.js"]
