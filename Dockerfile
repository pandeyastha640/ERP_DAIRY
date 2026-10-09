# Stage 1: Build React Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npx prisma generate
RUN npm run build

# Stage 2: Production Runtime
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=5000

COPY package*.json ./
RUN npm install --legacy-peer-deps --omit=dev

# Copy Prisma schema and generated client
COPY prisma ./prisma
RUN npx prisma generate

# Copy backend source & compile or run via tsx/node
COPY server ./server
COPY --from=frontend-builder /app/dist ./dist

# Expose production port
EXPOSE 5000

CMD ["npx", "tsx", "server/src/index.ts"]
