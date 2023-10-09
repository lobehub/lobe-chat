FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

## Install dependencies only when needed
FROM base AS builder
WORKDIR /app

COPY package.json ./

# If you want to build docker in China
RUN npm config set registry https://registry.npmmirror.com/
RUN pnpm install

COPY . .
RUN pnpm run build:docker # run build standalone for docker version

## Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

# set hostname to localhost
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
