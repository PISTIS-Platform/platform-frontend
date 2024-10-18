FROM node:20-slim AS builder
WORKDIR /app
COPY package.json /app/
COPY pnpm-lock.yaml /app/
RUN corepack enable && corepack prepare pnpm@latest-8 --activate
RUN pnpm install
COPY . /app
RUN pnpm run build

FROM node:20-slim
WORKDIR /app
COPY --from=builder /app/.output /app
ENV HOST=0.0.0.0
ENV PORT=8080
EXPOSE 8080
ENTRYPOINT [ "node", "./server/index.mjs" ]