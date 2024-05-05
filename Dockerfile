FROM node:22-slim AS base

## Sharp dependencies, copy all the files for production
FROM base AS sharp
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

RUN pnpm add sharp

## Install dependencies only when needed
FROM base AS builder
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

COPY package.json ./
COPY .npmrc ./

# If you want to build docker in China
RUN npm config set registry https://registry.npmmirror.com/
RUN pnpm i

COPY . .

ENV NEXT_PUBLIC_BASE_PATH ""

# Sentry
ENV NEXT_PUBLIC_SENTRY_DSN ""
ENV SENTRY_ORG ""
ENV SENTRY_PROJECT ""

# Posthog
ENV NEXT_PUBLIC_ANALYTICS_POSTHOG ""
ENV NEXT_PUBLIC_POSTHOG_KEY ""
ENV NEXT_PUBLIC_POSTHOG_HOST ""

# Umami
ENV NEXT_PUBLIC_ANALYTICS_UMAMI ""
ENV NEXT_PUBLIC_UMAMI_SCRIPT_URL ""
ENV NEXT_PUBLIC_UMAMI_WEBSITE_ID ""


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
COPY --from=sharp --chown=nextjs:nodejs /app/node_modules/.pnpm ./node_modules/.pnpm

USER nextjs

EXPOSE 3210

# set hostname to localhost
ENV HOSTNAME "0.0.0.0"
ENV PORT=3210

ENV PROXY_URL=""

# General Variables
ENV ACCESS_CODE ""

ENV DEFAULT_AGENT_CONFIG ""

ENV API_KEY_SELECT_MODE ""

# OpenAI
ENV OPENAI_API_KEY ""
ENV OPENAI_PROXY_URL ""
ENV OPENAI_MODEL_LIST ""

# Azure OpenAI
ENV USE_AZURE_OPENAI ""
ENV AZURE_API_KEY ""
ENV AZURE_API_VERSION ""

# Google
ENV GOOGLE_API_KEY ""

# Zhipu
ENV ZHIPU_API_KEY ""

# Moonshot
ENV MOONSHOT_API_KEY ""

# Ollama
ENV OLLAMA_PROXY_URL ""
ENV OLLAMA_MODEL_LIST ""

# Perplexity
ENV PERPLEXITY_API_KEY ""

# Anthropic
ENV ANTHROPIC_API_KEY ""

# Mistral
ENV MISTRAL_API_KEY ""

# OpenRouter
ENV OPENROUTER_API_KEY ""
ENV OPENROUTER_MODEL_LIST ""

# 01.AI
ENV ZEROONE_API_KEY ""

# TogetherAI
ENV TOGETHERAI_API_KEY ""

# Minimax
ENV MINIMAX_API_KEY ""



CMD if [ -n "$PROXY_URL" ]; then \
    export HOSTNAME="127.0.0.1"; \
    protocol=$(echo $PROXY_URL | cut -d: -f1); \
    host=$(echo $PROXY_URL | cut -d/ -f3 | cut -d: -f1); \
    port=$(echo $PROXY_URL | cut -d: -f3); \
    conf=/etc/proxychains.conf; \
    echo "strict_chain" > $conf; \
    echo "proxy_dns" >> $conf; \
    echo "remote_dns_subnet 224" >> $conf; \
    echo "tcp_read_time_out 15000" >> $conf; \
    echo "tcp_connect_time_out 8000" >> $conf; \
    echo "localnet 127.0.0.0/255.0.0.0" >> $conf; \
    echo "localnet ::1/128" >> $conf; \
    echo "[ProxyList]" >> $conf; \
    echo "$protocol $host $port" >> $conf; \
    cat /etc/proxychains.conf; \
    proxychains -f $conf node server.js; \
    else \
    node server.js; \
    fi
