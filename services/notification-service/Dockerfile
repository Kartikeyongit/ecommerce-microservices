FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production 2>/dev/null || npm install --production
COPY . .
EXPOSE 3005
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost:3005/health || exit 1
CMD ["node", "src/server.js"]
