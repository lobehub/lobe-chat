## Base image for all the stages
FROM node:20-alpine AS base

RUN \
    # Add user nextjs to run the app
    addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

## Install pnpm globally, set the registry to use the mirror in China if needed
FROM base AS pnpm

ARG USE_NPM_CN_MIRROR

ENV PNPM_HOME="/pnpm" \
    PATH="$PNPM_HOME:$PATH"

WORKDIR /app

RUN \
    # If you want to build docker in China, build with --build-arg USE_NPM_CN_MIRROR=true
    if [ "${USE_NPM_CN_MIRROR:-false}" = "true" ]; then \
        npm config set registry "https://registry.npmmirror.com/"; \
    fi \
    && export COREPACK_NPM_REGISTRY=$(npm config get registry | sed 's/\/$//') \
    && corepack enable \
    && corepack use pnpm

## Sharp dependencies, copy all the files for production
FROM pnpm AS sharp

WORKDIR /app

RUN pnpm add sharp

## Install dependencies only when needed
FROM pnpm AS builder

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

RUN pnpm i

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

# Copy all the files from app, set the correct permission for prerender cache
COPY --from=app --chown=nextjs:nodejs /app /app

ENV NODE_ENV="production"

# set hostname to localhost
ENV HOSTNAME="0.0.0.0" \
    PORT="3210"

# General Variables
ENV ACCESS_CODE="" \
    API_KEY_SELECT_MODE="" \
    FEATURE_FLAGS=""

# Model Variables
ENV \
    # Ai360
    AI360_API_KEY ENABLED_AI360="" \
    # Anthropic
    ANTHROPIC_API_KEY="" ANTHROPIC_PROXY_URL="" ENABLED_ANTHROPIC="" \
    # Amazon Bedrock
    AWS_ACCESS_KEY_ID="" AWS_SECRET_ACCESS_KEY="" AWS_REGION="" ENABLED_AWS_BEDROCK="" \
    # Azure OpenAI
    AZURE_API_KEY="" AZURE_API_VERSION="" AZURE_ENDPOINT="" AZURE_MODEL_LIST="" ENABLED_AZURE_OPENAI="" \
    # Baichuan
    BAICHUAN_API_KEY="" ENABLED_BAICHUAN="" \
    # DeepSeek
    DEEPSEEK_API_KEY="" ENABLED_DEEPSEEK="" \
    # Google
    GOOGLE_API_KEY="" GOOGLE_PROXY_URL="" ENABLED_GOOGLE="" \
    # Groq
    GROQ_API_KEY="" GROQ_PROXY_URL="" ENABLED_GROQ="" \
    # Minimax
    MINIMAX_API_KEY="" ENABLED_MINIMAX="" \
    # Mistral
    MISTRAL_API_KEY="" ENABLED_MISTRAL="" \
    # Moonshot
    MOONSHOT_API_KEY="" MOONSHOT_PROXY_URL="" ENABLED_MOONSHOT="" \
    # Novita
    NOVITA_API_KEY="" ENABLED_NOVITA="" \
    # Ollama
    OLLAMA_MODEL_LIST="" OLLAMA_PROXY_URL="" ENABLED_OLLAMA="" \
    # OpenAI
    OPENAI_API_KEY="" OPENAI_MODEL_LIST="" OPENAI_PROXY_URL="" ENABLED_OPENAI="" \
    # OpenRouter
    OPENROUTER_API_KEY="" OPENROUTER_MODEL_LIST="" ENABLED_OPENROUTER="" \
    # Perplexity
    PERPLEXITY_API_KEY="" PERPLEXITY_PROXY_URL="" ENABLED_PERPLEXITY="" \
    # Qwen
    QWEN_API_KEY="" ENABLED_QWEN="" \
    # Stepfun
    STEPFUN_API_KEY="" ENABLED_STEPFUN="" \
    # Taichu
    TAICHU_API_KEY="" ENABLED_TAICHU="" \
    # TogetherAI
    TOGETHERAI_API_KEY="" TOGETHERAI_MODEL_LIST="" ENABLED_TOGETHERAI="" \
    # 01.AI
    ZEROONE_API_KEY="" ENABLED_ZEROONE="" \
    # Zhipu
    ZHIPU_API_KEY="" ENABLED_ZHIPU=""

USER nextjs

EXPOSE 3210/tcp

CMD ["node", "/app/server.js"]
