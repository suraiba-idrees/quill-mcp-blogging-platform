FROM node:24-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY tsconfig.json ./

COPY src ./src

RUN npm run build && cp -r src/database/migrations dist/database/migrations

ENV NODE_ENV=production

ENV PORT=3000

ENV DATABASE_PATH=/data/quill.db

EXPOSE 3000

CMD ["npm", "start"]