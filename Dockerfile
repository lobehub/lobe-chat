## Base image for all the stages
FROM node:20-alpine AS base

ARG USE_NPM_CN_MIRROR

ENV PNPM_HOME="/pnpm" \
    PATH="$PNPM_HOME:$PATH"

# If you want to build docker in China, build with --build-arg USE_NPM_CN_MIRROR=true
RUN if [ "${USE_NPM_CN_MIRROR:-false}" = "true" ]; then \
        npm config set registry "https://registry.npmmirror.com/"; \
    fi

## Sharp dependencies, copy all the files for production
FROM base AS sharp

WORKDIR /app

RUN corepack enable \
    && pnpm add sharp

## Install dependencies only when needed
FROM base AS builder

WORKDIR /app

ENV NEXT_PUBLIC_BASE_PATH=""

# Sentry
ENV NEXT_PUBLIC_SENTRY_DSN="" \
    SENTRY_ORG="" \
    SENTRY_PROJECT=""

# Posthog
ENV NEXT_PUBLIC_ANALYTICS_POSTHOG="" \
    NEXT_PUBLIC_POSTHOG_HOST="" \
    NEXT_PUBLIC_POSTHOG_KEY=""

# Umami
ENV NEXT_PUBLIC_ANALYTICS_UMAMI="" \
    NEXT_PUBLIC_UMAMI_SCRIPT_URL="" \
    NEXT_PUBLIC_UMAMI_WEBSITE_ID=""

# Node
ENV NODE_OPTIONS="--max-old-space-size=8192"

COPY package.json ./
COPY .npmrc ./

RUN corepack enable \
    && pnpm i

COPY . .

# run build standalone for docker version
RUN npm run build:docker

## Application image, copy all the files for production
FROM scratch AS app

COPY --from=builder /app/public /app/public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder /app/.next/standalone /app/
COPY --from=builder /app/.next/static /app/.next/static
COPY --from=sharp /app/node_modules/.pnpm /app/node_modules/.pnpm

## Production image, copy all the files and run next
FROM base

WORKDIR /app

# Add user nextjs to run the app
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

USER nextjs

# Copy all the files from app, set the correct permission for prerender cache
COPY --from=app --chown=nextjs:nodejs /app /app

ENV NODE_ENV="production"

# set hostname to localhost
ENV HOSTNAME="0.0.0.0" \
    PORT="3210"

# General Variables
ENV ACCESS_CODE="" \
    API_KEY_SELECT_MODE=""

# Model Variables
ENV \
    # Anthropic
    ANTHROPIC_API_KEY="" \
    # Azure OpenAI
    AZURE_API_KEY="" AZURE_API_VERSION="" USE_AZURE_OPENAI="" \
    # DeepSeek
    DEEPSEEK_API_KEY="" \
    # Google
    GOOGLE_API_KEY="" \
    # Minimax
    MINIMAX_API_KEY="" \
    # Mistral
    MISTRAL_API_KEY="" \
    # Moonshot
    MOONSHOT_API_KEY="" \
    # Ollama
    OLLAMA_MODEL_LIST="" OLLAMA_PROXY_URL="" \
    # OpenAI
    OPENAI_API_KEY="" OPENAI_MODEL_LIST="" OPENAI_PROXY_URL="" \
    # OpenRouter
    OPENROUTER_API_KEY="" OPENROUTER_MODEL_LIST="" \
    # Perplexity
    PERPLEXITY_API_KEY="" \
    # Qwen
    QWEN_API_KEY="" \
    # TogetherAI
    TOGETHERAI_API_KEY="" \
    # 01.AI
    ZEROONE_API_KEY="" \
    # Zhipu
    ZHIPU_API_KEY=""

EXPOSE 3210/tcp

CMD ["node", "server.js"]
