FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:20-alpine

RUN addgroup -g 1001 -S nestjs && adduser -S -u 1001 -G nestjs nestjs

WORKDIR /app

COPY --from=build --chown=nestjs:nestjs /app/dist ./dist
COPY --from=build --chown=nestjs:nestjs /app/node_modules ./node_modules
COPY --from=build --chown=nestjs:nestjs /app/package.json ./

USER nestjs

EXPOSE 3000

CMD ["node", "dist/main"]
