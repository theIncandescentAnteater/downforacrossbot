# Install stage: cache dependencies in temp dir for faster rebuilds
FROM oven/bun:1 AS install
WORKDIR /usr/src/app

RUN mkdir -p /temp/dev
COPY package.json bun.lock /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

RUN mkdir -p /temp/prod
COPY package.json bun.lock /temp/prod/
RUN cd /temp/prod && bun install --frozen-lockfile --production

# Build stage: compile TypeScript
FROM oven/bun:1 AS build
WORKDIR /usr/src/app

COPY --from=install /temp/dev/node_modules node_modules
COPY . .

ENV NODE_ENV=production
RUN bun run build

# Production stage: minimal image with prod deps and dist only
FROM oven/bun:1-slim AS release
WORKDIR /usr/src/app

ENV NODE_ENV=production

COPY --from=install /temp/prod/node_modules node_modules
COPY package.json bun.lock ./
COPY --from=build /usr/src/app/dist ./dist

USER bun
ENTRYPOINT ["bun", "dist/index.js"]
