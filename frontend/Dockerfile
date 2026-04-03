FROM node:20-slim

WORKDIR /app

RUN npm install -g vite

COPY package*.json vite.config.ts ./

RUN npm i

COPY . .

EXPOSE 3000

# Use explicit host and port
CMD ["npm", "run", "dev"]