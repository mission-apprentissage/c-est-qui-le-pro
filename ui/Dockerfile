ARG ACCOMPAGNATEUR_ENV=production
#From https://github.com/vercel/next.js/blob/canary/examples/with-docker/Dockerfile
# Install dependencies only when needed
FROM node:18-alpine AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json .
COPY yarn.lock .
COPY shared/package.json shared/
COPY ui/package.json ui/
RUN yarn install --frozen-lockfile

# Rebuild the source code only when needed
FROM node:18-alpine AS builder-production
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/shared/node_modules ./shared/node_modules
COPY --from=deps /app/ui/node_modules ./ui/node_modules
COPY --from=deps /app/package.json ./package.json
COPY --from=deps /app/yarn.lock ./yarn.lock
COPY ./shared shared
COPY ./ui ui

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
ENV NEXT_TELEMETRY_DISABLED 1

ARG ACCOMPAGNATEUR_API_BASE_URL
ARG EXPOSITION_API_BASE_URL
ARG NEXT_PUBLIC_DOMAIN
ARG NEXT_PUBLIC_API_BASE_URL
ARG NEXT_PUBLIC_EXPOSITION_WIDGET_HASH
ARG NEXT_PUBLIC_EXPOSITION_API_BASE_URL
ARG NEXT_PUBLIC_ACCOMPAGNATEUR_API_BASE_URL
ARG NEXT_PUBLIC_SIRIUS_API_BASE_URL
ARG NEXT_PUBLIC_LOGROCKET
ARG BASE_PATH

ENV HAS_PROXY true
ENV ACCOMPAGNATEUR_API_BASE_URL $ACCOMPAGNATEUR_API_BASE_URL
ENV EXPOSITION_API_BASE_URL $EXPOSITION_API_BASE_URL
ENV NEXT_PUBLIC_DOMAIN $NEXT_PUBLIC_DOMAIN
ENV NEXT_PUBLIC_API_BASE_URL $NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_EXPOSITION_WIDGET_HASH $NEXT_PUBLIC_EXPOSITION_WIDGET_HASH
ENV NEXT_PUBLIC_ACCOMPAGNATEUR_API_BASE_URL $NEXT_PUBLIC_ACCOMPAGNATEUR_API_BASE_URL
ENV NEXT_PUBLIC_EXPOSITION_API_BASE_URL $NEXT_PUBLIC_EXPOSITION_API_BASE_URL
ENV NEXT_PUBLIC_SIRIUS_API_BASE_URL $NEXT_PUBLIC_SIRIUS_API_BASE_URL
ENV NEXT_PUBLIC_LOGROCKET $NEXT_PUBLIC_LOGROCKET
ENV BASE_PATH $BASE_PATH

RUN yarn workspace ui build

# Production image, copy all the files and run next
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
# Uncomment the following line in case you want to disable telemetry during runtime.
ENV NEXT_TELEMETRY_DISABLED 1
ENV HAS_PROXY true

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# You only need to copy next.config.js if you are NOT using the default configuration
COPY --from=builder-production /app/ui/next.config.js ./ui/next.config.js
# COPY --from=builder-production /app/ui/public ./ui/public
COPY --from=builder-production /app/ui/package.json ./ui/package.json

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder-production --chown=nextjs:nodejs /app/ui/.next/standalone/ ./ui/
COPY --from=builder-production --chown=nextjs:nodejs /app/ui/.next/standalone/ui/ ./ui/
COPY --from=builder-production --chown=nextjs:nodejs /app/ui/.next/static ./ui/.next/static


USER nextjs

EXPOSE 3000

ENV PORT 3000
WORKDIR /app/ui

CMD ["node", "server.js"]