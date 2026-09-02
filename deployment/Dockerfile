FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY tsconfig.json ./
COPY src ./src
COPY migrations ./migrations

RUN npm run build

ENV NODE_ENV=production
ENV PORT=3000
ENV DATABASE_PATH=/data/quill.db

EXPOSE 3000

CMD ["npm", "start"]