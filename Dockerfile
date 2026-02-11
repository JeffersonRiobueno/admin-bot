## Multi-stage Dockerfile: build frontend, then run server and serve static files

### Builder: build the frontend
FROM node:20-alpine AS builder
WORKDIR /app

# copy root package.json and install frontend dev deps
COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps || true

# copy full repo and build frontend
COPY . .
RUN npm run build

### Runner: small image with server and built frontend
FROM node:20-alpine AS runner
WORKDIR /app

# copy server code and install only server deps
COPY server/package.json server/package-lock.json* ./server/
WORKDIR /app/server
RUN npm install --production --legacy-peer-deps || true

# copy built frontend from builder
WORKDIR /app
COPY --from=builder /app/dist ./dist
# copy server code
COPY --from=builder /app/server ./server

WORKDIR /app/server
ENV NODE_ENV=production
EXPOSE 4000
CMD ["node","index.js"]
