# ---- Base build image ----
FROM node:22-slim AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy everything
COPY . .

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build client and server
RUN pnpm build

# ---- Runtime image ----
FROM node:22-slim AS runner

WORKDIR /app

# Copy production dependencies only
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./
RUN corepack enable && corepack prepare pnpm@latest --activate && pnpm install --prod

# Copy built outputs
COPY --from=builder /app/dist/client ./dist/client
COPY --from=builder /app/dist/server ./dist/server

# Run the server
CMD ["pnpm", "start:server"]