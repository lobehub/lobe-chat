import { describe, expect, it, vi } from 'vitest';

import { appEnv, getAppConfig } from '@/config/app';
import { authEnv } from '@/config/auth';
import { fileEnv } from '@/config/file';
import { knowledgeEnv } from '@/config/knowledge';
import { langfuseEnv } from '@/config/langfuse';
import { enableNextAuth } from '@/const/auth';
import { isDesktop } from '@/const/version';
import { parseSystemAgent } from '@/server/globalConfig/parseSystemAgent';
import { SystemEmbeddingConfig } from '@/types/knowledgeBase';
import { GlobalServerConfig } from '@/types/serverConfig';
import { ProviderConfig, UserSystemAgentConfig } from '@/types/user/settings';

import { genServerLLMConfig } from './_deprecated';
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
    SYSTEM_AGENT: 'test-agent',
  },
}));

vi.mock('@/config/auth', () => ({
  authEnv: {
    NEXT_AUTH_SSO_PROVIDERS: 'github,google',
  },
}));

vi.mock('@/config/file', () => ({
  fileEnv: {
    S3_SECRET_ACCESS_KEY: 'test-key',
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
  isDesktop: false,
}));

vi.mock('./parseSystemAgent', () => ({
  parseSystemAgent: vi.fn(),
}));

vi.mock('./parseDefaultAgent', () => ({
  parseAgentConfig: vi.fn(),
}));

vi.mock('./parseFilesConfig', () => ({
  parseFilesConfig: vi.fn(),
}));

vi.mock('./_deprecated', () => ({
  genServerLLMConfig: vi.fn(),
}));

vi.mock('./genServerAiProviderConfig', () => ({
  genServerAiProvidersConfig: vi.fn(),
}));

describe('getServerGlobalConfig', () => {
  it('should return correct global config', async () => {
    const mockAgentConfig = { key: 'value' };
    const mockSystemAgent = {
      systemRole: 'test role',
    } as Partial<UserSystemAgentConfig>;
    const mockProviders: Record<string, ProviderConfig> = {
      azure: { enabled: true },
      bedrock: { enabled: true },
    };

    vi.mocked(getAppConfig).mockReturnValue({
      ACCESS_CODES: ['code1', 'code2'],
      DEFAULT_AGENT_CONFIG: 'test_config',
    } as any);

    vi.mocked(parseAgentConfig).mockReturnValue(mockAgentConfig);
    vi.mocked(parseSystemAgent).mockReturnValue(mockSystemAgent);
    vi.mocked(genServerAiProvidersConfig).mockReturnValue(mockProviders);
    vi.mocked(genServerLLMConfig).mockReturnValue({ deprecated: true } as any);

    const config = await getServerGlobalConfig();

    expect(config).toEqual({
      aiProvider: mockProviders,
      defaultAgent: {
        config: mockAgentConfig,
      },
      enableUploadFileToServer: true,
      enabledAccessCode: true,
      enabledOAuthSSO: true,
      languageModel: { deprecated: true },
      oAuthSSOProviders: ['github', 'google'],
      systemAgent: mockSystemAgent,
      telemetry: {
        langfuse: true,
      },
    });
  });

  it('should handle empty ACCESS_CODES', async () => {
    vi.mocked(getAppConfig).mockReturnValue({
      ACCESS_CODES: [],
      DEFAULT_AGENT_CONFIG: 'test_config',
    } as any);

    const config = await getServerGlobalConfig();

    expect(config.enabledAccessCode).toBe(false);
  });

  it('should configure AI providers correctly', async () => {
    const mockProviders: Record<string, ProviderConfig> = {
      azure: {
        enabled: true,
      },
      bedrock: {
        enabled: true,
      },
      giteeai: {
        enabled: true,
      },
      lmstudio: {
        enabled: true,
        fetchOnClient: false,
      },
      ollama: {
        enabled: true,
        fetchOnClient: true,
      },
      tencentcloud: {
        enabled: true,
      },
      volcengine: {
        enabled: true,
      },
    };

    vi.mocked(genServerAiProvidersConfig).mockReturnValue(mockProviders);

    const config = await getServerGlobalConfig();

    expect(config.aiProvider).not.toHaveProperty('doubao');
    expect(config.aiProvider).toHaveProperty('azure');
    expect(config.aiProvider).toHaveProperty('bedrock');
    expect(config.aiProvider).toHaveProperty('giteeai');
  });
});

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
    const mockConfig: SystemEmbeddingConfig = {
      embeddingModel: {
        model: 'test-model',
        provider: 'test-provider',
      },
      queryMode: 'hybrid',
      rerankerModel: {
        model: 'test-reranker',
        provider: 'test-provider',
      },
    };

    vi.mocked(parseFilesConfig).mockReturnValue(mockConfig);

    const result = getServerDefaultFilesConfig();

    expect(parseFilesConfig).toHaveBeenCalledWith('test_config');
    expect(result).toEqual(mockConfig);
  });
});
