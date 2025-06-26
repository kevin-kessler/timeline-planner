# ---- Base build image ----
FROM node:22-slim AS builder

WORKDIR /app

# Copy everything
COPY . .

# Install dependencies
RUN npm run install

# Build client and server
RUN npm run build

# ---- Runtime image ----
FROM node:22-slim AS runner

WORKDIR /app

# Copy production dependencies only
COPY --from=builder /app/package.json ./

# Copy built outputs
COPY --from=builder /app/dist/client ./dist/client
COPY --from=builder /app/dist/server ./dist/server

# Run the server
CMD ["npm run", "start:server"]