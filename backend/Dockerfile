FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN apt-get update && apt-get install -y netcat-openbsd
EXPOSE 4000
CMD ["node", "index.js"]

