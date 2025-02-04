import { describe, expect, it, vi } from 'vitest';

import { getLLMConfig } from './llm';

vi.mock('@t3-oss/env-nextjs', () => ({
  createEnv: vi.fn().mockImplementation(({ runtimeEnv }) => runtimeEnv),
}));

describe('getLLMConfig', () => {
  it('should return config with default values when no env vars set', () => {
    const config = getLLMConfig();

    expect(config.ENABLED_OPENAI).toBe(true);
    expect(config.ENABLED_OLLAMA).toBe(true);
    expect(config.ENABLED_AWS_BEDROCK).toBe(false);
  });

  it('should enable providers when API keys are set', () => {
    vi.stubEnv('OPENAI_API_KEY', 'test-key');
    vi.stubEnv('AZURE_API_KEY', 'azure-key');
    vi.stubEnv('ANTHROPIC_API_KEY', 'anthropic-key');

    const config = getLLMConfig();

    expect(config.ENABLED_OPENAI).toBe(true);
    expect(config.OPENAI_API_KEY).toBe('test-key');
    expect(config.ENABLED_AZURE_OPENAI).toBe(true);
    expect(config.AZURE_API_KEY).toBe('azure-key');
    expect(config.ENABLED_ANTHROPIC).toBe(true);
    expect(config.ANTHROPIC_API_KEY).toBe('anthropic-key');
  });

  it('should disable providers when explicitly set to 0', () => {
    vi.stubEnv('ENABLED_OPENAI', '0');
    vi.stubEnv('ENABLED_OLLAMA', '0');

    const config = getLLMConfig();

    expect(config.ENABLED_OPENAI).toBe(false);
    expect(config.ENABLED_OLLAMA).toBe(false);
  });

  it('should enable AWS Bedrock when explicitly set to 1', () => {
    vi.stubEnv('ENABLED_AWS_BEDROCK', '1');
    vi.stubEnv('AWS_ACCESS_KEY_ID', 'test-key');
    vi.stubEnv('AWS_SECRET_ACCESS_KEY', 'test-secret');
    vi.stubEnv('AWS_REGION', 'us-east-1');

    const config = getLLMConfig();

    expect(config.ENABLED_AWS_BEDROCK).toBe(true);
    expect(config.AWS_ACCESS_KEY_ID).toBe('test-key');
    expect(config.AWS_SECRET_ACCESS_KEY).toBe('test-secret');
    expect(config.AWS_REGION).toBe('us-east-1');
  });

  it('should enable Cloudflare only when both API key and account ID are set', () => {
    vi.stubEnv('CLOUDFLARE_API_KEY', 'cf-key');
    vi.stubEnv('CLOUDFLARE_BASE_URL_OR_ACCOUNT_ID', 'cf-account');

    const config = getLLMConfig();

    expect(config.ENABLED_CLOUDFLARE).toBe(true);
    expect(config.CLOUDFLARE_API_KEY).toBe('cf-key');
    expect(config.CLOUDFLARE_BASE_URL_OR_ACCOUNT_ID).toBe('cf-account');
  });

  it('should disable Cloudflare when either API key or account ID is missing', () => {
    vi.stubEnv('CLOUDFLARE_API_KEY', 'cf-key');
    vi.stubEnv('CLOUDFLARE_BASE_URL_OR_ACCOUNT_ID', '');

    const config = getLLMConfig();

    expect(config.ENABLED_CLOUDFLARE).toBe(false);
  });

  it('should enable Wenxin when API key is set', () => {
    vi.stubEnv('WENXIN_API_KEY', 'wenxin-key');

    const config = getLLMConfig();

    expect(config.ENABLED_WENXIN).toBe(true);
    expect(config.WENXIN_API_KEY).toBe('wenxin-key');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });
});
