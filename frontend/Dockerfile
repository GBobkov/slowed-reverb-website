FROM node:20-alpine AS builder

WORKDIR /app

ARG VITE_API_URL=https://your-api.com/api/
ENV VITE_API_URL=$VITE_API_URL

COPY package*.json ./
RUN npm ci && npm cache clean --force

COPY . .
RUN npm run build 

FROM nginx:1.28-alpine

COPY --from=builder /app/build /usr/share/nginx/html

RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    location /assets { \
        expires 1y; \
        add_header Cache-Control "public, immutable"; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
