import { describe, expect, it, vi } from 'vitest';

import { getLLMConfig } from './llm';

// Mock @t3-oss/env-nextjs to avoid server-side environment validation
vi.mock('@t3-oss/env-nextjs', () => ({
  createEnv: ({ runtimeEnv }: any) => runtimeEnv,
}));

describe('getLLMConfig', () => {
  const defaultEnv = {
    NODE_ENV: 'test' as const,
    NEXT_PUBLIC_DEVELOPER_DEBUG: 'false',
    NEXT_PUBLIC_I18N_DEBUG: 'false',
    NEXT_PUBLIC_I18N_DEBUG_BROWSER: 'false',
    NEXT_PUBLIC_I18N_DEBUG_SERVER: 'false',
  };

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...defaultEnv };
  });

  it('should return config with default values when no env vars set', () => {
    const config = getLLMConfig();

    expect(config.ENABLED_OPENAI).toBe(true);
    expect(config.OPENAI_API_KEY).toBeUndefined();
    expect(config.ENABLED_OLLAMA).toBe(true);
  });

  it('should handle API key select mode', () => {
    process.env.API_KEY_SELECT_MODE = 'random';
    const config = getLLMConfig();
    expect(config.API_KEY_SELECT_MODE).toBe('random');
  });

  it('should enable services based on API keys', () => {
    process.env.OPENAI_API_KEY = 'test-key';
    process.env.AZURE_API_KEY = 'azure-key';
    process.env.ZHIPU_API_KEY = 'zhipu-key';
    process.env.ANTHROPIC_API_KEY = 'anthropic-key';

    const config = getLLMConfig();

    expect(config.ENABLED_OPENAI).toBe(true);
    expect(config.ENABLED_AZURE_OPENAI).toBe(true);
    expect(config.ENABLED_ZHIPU).toBe(true);
    expect(config.ENABLED_ANTHROPIC).toBe(true);
  });

  it('should handle AWS Bedrock configuration', () => {
    process.env.ENABLED_AWS_BEDROCK = '1';
    process.env.AWS_REGION = 'us-east-1';
    process.env.AWS_ACCESS_KEY_ID = 'access-key';
    process.env.AWS_SECRET_ACCESS_KEY = 'secret-key';
    process.env.AWS_SESSION_TOKEN = 'session-token';

    const config = getLLMConfig();

    expect(config.ENABLED_AWS_BEDROCK).toBe(true);
    expect(config.AWS_REGION).toBe('us-east-1');
    expect(config.AWS_ACCESS_KEY_ID).toBe('access-key');
    expect(config.AWS_SECRET_ACCESS_KEY).toBe('secret-key');
    expect(config.AWS_SESSION_TOKEN).toBe('session-token');
  });

  it('should handle Cloudflare configuration', () => {
    process.env.CLOUDFLARE_API_KEY = 'cf-key';
    process.env.CLOUDFLARE_BASE_URL_OR_ACCOUNT_ID = 'cf-account';

    const config = getLLMConfig();

    expect(config.ENABLED_CLOUDFLARE).toBe(true);
    expect(config.CLOUDFLARE_API_KEY).toBe('cf-key');
    expect(config.CLOUDFLARE_BASE_URL_OR_ACCOUNT_ID).toBe('cf-account');
  });

  it('should handle Wenxin configuration', () => {
    process.env.WENXIN_API_KEY = 'wenxin-key';

    const config = getLLMConfig();

    expect(config.ENABLED_WENXIN).toBe(true);
    expect(config.WENXIN_API_KEY).toBe('wenxin-key');
  });

  it('should handle disabled services', () => {
    process.env.ENABLED_OPENAI = '0';
    process.env.ENABLED_OLLAMA = '0';
    process.env.ENABLED_AWS_BEDROCK = '0';

    const config = getLLMConfig();

    expect(config.ENABLED_OPENAI).toBe(false);
    expect(config.ENABLED_OLLAMA).toBe(false);
    expect(config.ENABLED_AWS_BEDROCK).toBe(false);
  });

  it('should handle other service configurations', () => {
    process.env.GOOGLE_API_KEY = 'google-key';
    process.env.MINIMAX_API_KEY = 'minimax-key';
    process.env.MISTRAL_API_KEY = 'mistral-key';
    process.env.GROQ_API_KEY = 'groq-key';

    const config = getLLMConfig();

    expect(config.ENABLED_GOOGLE).toBe(true);
    expect(config.GOOGLE_API_KEY).toBe('google-key');
    expect(config.ENABLED_MINIMAX).toBe(true);
    expect(config.MINIMAX_API_KEY).toBe('minimax-key');
    expect(config.ENABLED_MISTRAL).toBe(true);
    expect(config.MISTRAL_API_KEY).toBe('mistral-key');
    expect(config.ENABLED_GROQ).toBe(true);
    expect(config.GROQ_API_KEY).toBe('groq-key');
  });

  afterEach(() => {
    vi.resetModules();
    process.env = { ...defaultEnv };
  });
});
