FROM node:22-slim AS builder
WORKDIR /app
COPY package.json /app/
COPY pnpm-lock.yaml /app/
COPY .npmrc /app/
RUN corepack enable && corepack prepare pnpm@latest-10 --activate
RUN pnpm install
COPY . /app
RUN pnpm run build

FROM node:22-slim
WORKDIR /app
COPY --from=builder /app/.output /app
ENV HOST=0.0.0.0
ENV PORT=8080
ENV STORAGE_DRIVER=redis
EXPOSE 8080
ENTRYPOINT [ "node", "./server/index.mjs" ]