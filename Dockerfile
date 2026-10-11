# ------------------------------------------------------------------------------
# Stage 1: Build the React 19 Frontend
# ------------------------------------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package descriptors
COPY package*.json ./

# Install dependencies (using legacy peer deps for Vite 8 compatibility)
RUN npm ci --legacy-peer-deps

# Copy application source
COPY . .

# Build production static bundle
RUN npm run build

# ------------------------------------------------------------------------------
# Stage 2: Serve with High-Performance Nginx Alpine
# ------------------------------------------------------------------------------
FROM nginx:alpine-slim

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy built frontend assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose HTTP port 80
EXPOSE 80

# Start Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
