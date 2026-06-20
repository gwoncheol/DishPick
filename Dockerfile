FROM node:22-alpine AS build

WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY web/package.json ./

RUN npm install

COPY web/ ./

RUN npm run build



FROM node:22-alpine

WORKDIR /app

RUN apk add --no-cache python3 make g++

ENV NODE_ENV=production

ENV DATABASE_PATH=/app/data/dishpick.db

COPY --from=build /app/.output ./.output

COPY --from=build /app/node_modules ./node_modules

COPY --from=build /app/package.json ./package.json

RUN mkdir -p /app/data

WORKDIR /app/.output

EXPOSE 3000

CMD ["node", "server/index.mjs"]


