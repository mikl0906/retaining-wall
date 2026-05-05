# Build stage
FROM node:current-alpine3.23 AS builder
WORKDIR /app
ENV NODE_ENV="production"
COPY package.json package-lock.json ./
RUN npm ci --include=dev
COPY . .
RUN npm run build

# Serve stage
FROM pierrezemb/gostatic
COPY --from=builder /app/dist /srv/http/
CMD ["-port","8080","-https-promote", "-enable-logging"]
