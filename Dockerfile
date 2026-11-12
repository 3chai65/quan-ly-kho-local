# Giai đoạn build: cần công cụ biên dịch cho better-sqlite3 (node-gyp); không đưa sang image cuối.
FROM node:22-bookworm-slim AS build

RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Giai đoạn cuối: không có python3/make/g++, chạy bằng user node.
FROM node:22-bookworm-slim

WORKDIR /app

COPY --from=build /app/node_modules ./node_modules
COPY package.json package-lock.json ./
COPY server.js auth.js ./
COPY src ./src
COPY scripts ./scripts
COPY tests ./tests

ENV NODE_ENV=production
ENV PORT=8787
ENV DATA_DIR=/data

# /data tạo sẵn thuộc node để volume mới (không bind) cũng ghi được.
RUN mkdir -p /data && chown node:node /data

USER node

EXPOSE 8787

CMD ["node", "server.js"]
