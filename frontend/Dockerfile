FROM node:20-alpine AS builder

WORKDIR /app

ARG VITE_API_URL=http://localhost:8000/api/
ENV VITE_API_URL=$VITE_API_URL

COPY package*.json ./
RUN npm ci && npm cache clean --force

COPY . .
RUN npm run build 

FROM nginx:1.28-alpine

COPY --from=builder /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
