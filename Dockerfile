# Multi-stage build voor IT Hulp Klantensysteem

# Stage 1: Build React frontend
FROM node:18-alpine AS frontend-builder

WORKDIR /app/client

# Copy client package files
COPY client/package*.json ./

# Install client dependencies (including devDependencies for build)
RUN npm ci

# Copy client source
COPY client/ ./

# Build React app
RUN npm run build

# Stage 2: Backend + serve frontend
FROM node:18-alpine

WORKDIR /app

# Copy server package files
COPY package*.json ./

# Install server dependencies
RUN npm ci --only=production

# Copy server source
COPY server/ ./server/
COPY scripts/ ./scripts/

# Copy built frontend from builder stage
COPY --from=frontend-builder /app/client/build ./client/build

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start server
CMD ["node", "server/index.js"]
