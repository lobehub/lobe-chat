import { describe, expect, it, vi } from 'vitest';

import { getAppConfig } from '@/config/app';
import { authEnv } from '@/config/auth';
import { fileEnv } from '@/config/file';
import { knowledgeEnv } from '@/config/knowledge';
import { langfuseEnv } from '@/config/langfuse';
import { enableNextAuth } from '@/const/auth';
import { isDesktop } from '@/const/version';
import { parseSystemAgent } from '@/server/globalConfig/parseSystemAgent';

import { genServerAiProvidersConfig } from './genServerAiProviderConfig';
import {
  getServerDefaultAgentConfig,
  getServerDefaultFilesConfig,
  getServerGlobalConfig,
} from './index';
import { parseAgentConfig } from './parseDefaultAgent';
import { parseFilesConfig } from './parseFilesConfig';

vi.mock('@/config/app', () => ({
  getAppConfig: vi.fn(),
  appEnv: {
    SYSTEM_AGENT: 'test_system_agent',
  },
}));

vi.mock('@/config/auth', () => ({
  authEnv: {
    NEXT_AUTH_SSO_PROVIDERS: 'github,google',
  },
}));

vi.mock('@/config/file', () => ({
  fileEnv: {
    S3_SECRET_ACCESS_KEY: 'test_key',
  },
}));

vi.mock('@/config/knowledge', () => ({
  knowledgeEnv: {
    DEFAULT_FILES_CONFIG: 'test_config',
  },
}));

vi.mock('@/config/langfuse', () => ({
  langfuseEnv: {
    ENABLE_LANGFUSE: true,
  },
}));

vi.mock('@/const/auth', () => ({
  enableNextAuth: true,
}));

vi.mock('@/const/version', () => ({
  isDesktop: vi.fn().mockReturnValue(false),
}));

vi.mock('@/server/globalConfig/parseSystemAgent', () => ({
  parseSystemAgent: vi.fn(),
}));

vi.mock('./parseDefaultAgent', () => ({
  parseAgentConfig: vi.fn(),
}));

vi.mock('./parseFilesConfig', () => ({
  parseFilesConfig: vi.fn(),
}));

vi.mock('./genServerAiProviderConfig', () => ({
  genServerAiProvidersConfig: vi.fn(),
}));

vi.mock('./_deprecated', () => ({
  genServerLLMConfig: () => ({}),
}));

describe('getServerDefaultAgentConfig', () => {
  it('should return parsed agent config', () => {
    const mockConfig = { key: 'value' };
    vi.mocked(getAppConfig).mockReturnValue({
      DEFAULT_AGENT_CONFIG: 'test_agent_config',
    } as any);
    vi.mocked(parseAgentConfig).mockReturnValue(mockConfig);

    const result = getServerDefaultAgentConfig();

    expect(parseAgentConfig).toHaveBeenCalledWith('test_agent_config');
    expect(result).toEqual(mockConfig);
  });

  it('should return empty object if parseAgentConfig returns undefined', () => {
    vi.mocked(getAppConfig).mockReturnValue({
      DEFAULT_AGENT_CONFIG: 'test_agent_config',
    } as any);
    vi.mocked(parseAgentConfig).mockReturnValue(undefined);

    const result = getServerDefaultAgentConfig();

    expect(result).toEqual({});
  });
});

describe('getServerDefaultFilesConfig', () => {
  it('should return parsed files config', () => {
    const mockConfig = {
      embeddingModel: {
        model: 'test-model',
        provider: 'test-provider',
      },
      queryMode: 'hybrid',
      rerankerModel: {
        model: 'test-reranker',
        provider: 'test-provider',
      },
    } as any;

    vi.mocked(parseFilesConfig).mockReturnValue(mockConfig);

    const result = getServerDefaultFilesConfig();

    expect(parseFilesConfig).toHaveBeenCalledWith('test_config');
    expect(result).toEqual(mockConfig);
  });
});

describe('getServerGlobalConfig', () => {
  beforeEach(() => {
    vi.mocked(getAppConfig).mockReturnValue({
      ACCESS_CODES: ['code1', 'code2'],
      DEFAULT_AGENT_CONFIG: 'test_agent_config',
    } as any);

    vi.mocked(parseSystemAgent).mockReturnValue({
      agentMeta: { model: 'test-model', provider: 'test-provider' },
      historyCompress: { model: 'test-model', provider: 'test-provider' },
      queryRewrite: { enabled: true, model: 'test-model', provider: 'test-provider' },
      thread: { model: 'test-model', provider: 'test-provider' },
      topic: { model: 'test-model', provider: 'test-provider' },
      translation: { model: 'test-model', provider: 'test-provider' },
    } as any);

    vi.mocked(parseAgentConfig).mockReturnValue({ model: 'test-model' } as any);

    vi.mocked(genServerAiProvidersConfig).mockReturnValue({
      azure: { enabled: false },
      bedrock: { enabled: false },
      ollama: { enabled: true, fetchOnClient: false },
      openai: { enabled: false },
      tencentcloud: { enabled: false },
      volcengine: { enabled: false },
    } as any);
  });

  it('should include tencentcloud provider config with correct keys', async () => {
    const config = await getServerGlobalConfig();

    expect(genServerAiProvidersConfig).toHaveBeenCalledWith(
      expect.objectContaining({
        tencentcloud: {
          enabledKey: 'ENABLED_TENCENT_CLOUD',
          modelListKey: 'TENCENT_CLOUD_MODEL_LIST',
        },
      }),
    );
  });

  it('should include all required config fields', async () => {
    const config = await getServerGlobalConfig();

    expect(config).toEqual({
      aiProvider: expect.any(Object),
      defaultAgent: {
        config: { model: 'test-model' },
      },
      enableUploadFileToServer: true,
      enabledAccessCode: true,
      enabledOAuthSSO: true,
      languageModel: expect.any(Object),
      oAuthSSOProviders: ['github', 'google'],
      systemAgent: expect.objectContaining({
        agentMeta: expect.any(Object),
        historyCompress: expect.any(Object),
        queryRewrite: expect.any(Object),
        thread: expect.any(Object),
        topic: expect.any(Object),
        translation: expect.any(Object),
      }),
      telemetry: {
        langfuse: true,
      },
    });
  });
});
