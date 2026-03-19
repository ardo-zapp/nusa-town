# ============================================
# Stage 1: Builder
# ============================================
FROM node:24-trixie AS builder

WORKDIR /app

# Install system dependencies required by 'canvas' npm package
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    pkg-config \
    python3 \
    && rm -rf /var/lib/apt/lists/*

# Install npm dependencies (cached layer if package files don't change)
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

# Copy source code and build
# Use config-template.json as config.json for build (real config is mounted at runtime)
COPY . .
RUN cp config-template.json config.json
RUN npm run build -- --fast

# ============================================
# Stage 2: Production
# ============================================
FROM node:24-trixie-slim AS production

WORKDIR /app

# Install only runtime libraries for 'canvas' (no -dev packages)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libcairo2 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libjpeg62-turbo \
    libgif7 \
    librsvg2-2 \
    && rm -rf /var/lib/apt/lists/*

# Copy built artifacts from builder stage
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/build ./build
COPY --from=builder /app/src ./src
COPY --from=builder /app/views ./views
COPY --from=builder /app/favicons ./favicons
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pony-town.js ./
COPY --from=builder /app/pony-town-offline.js ./
COPY --from=builder /app/cli.js ./

# Expose game server and admin panel ports
EXPOSE 8090 8091

# Start the server with increased memory allocation
CMD ["node", "--max_old_space_size=4096", "pony-town.js", "--login", "--admin", "--game", "main"]
