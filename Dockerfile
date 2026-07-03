FROM oven/bun:1.3-alpine

WORKDIR /app

COPY package.json bun.lock ./
COPY apps/api/package.json apps/api/package.json
COPY apps/dashboard/package.json apps/dashboard/package.json
COPY packages/shared/package.json packages/shared/package.json

RUN bun install --frozen-lockfile

COPY packages/shared packages/shared
COPY apps/api apps/api

ENV NODE_ENV=production

CMD ["bun", "--filter", "@cerbero/api", "start"]
