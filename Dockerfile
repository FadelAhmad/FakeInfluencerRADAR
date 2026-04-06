# Frontend (Next.js) multi-stage build
FROM node:20-alpine AS builder
WORKDIR /app

# copy package files first for caching
COPY package.json package-lock.json* ./
RUN npm ci --silent

# copy rest and build
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/package.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["npm","start"]
