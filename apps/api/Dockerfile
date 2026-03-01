FROM node:20-alpine
WORKDIR /app
RUN corepack enable
COPY package.json ../../pnpm-workspace.yaml /app/
COPY ../../ /app
RUN pnpm install --frozen-lockfile=false
WORKDIR /app/apps/api
RUN pnpm build
CMD ["pnpm","dev"]
