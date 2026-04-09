# STAGE 1: BUILDER (has Node.js, compiles React to static files)
FROM node:20-alpine AS builder

WORKDIR /app

# Build-time configuration
ARG VITE_API_URL=https://your-api.com/api/
ENV VITE_API_URL=$VITE_API_URL

# Install dependencies
COPY package*.json ./
RUN npm ci && npm cache clean --force

# Copy source and build
COPY . .
RUN npm run build  # Creates /app/dist with static files

# STAGE 2: PRODUCTION (NO Node.js, just serve static files)
FROM nginx:alpine

# Copy ONLY the built static files from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Optional: Custom nginx config for SPA routing
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
