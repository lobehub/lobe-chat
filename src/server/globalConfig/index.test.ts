import { describe, expect, it, vi } from 'vitest';

import { getAppConfig } from '@/config/app';
import { authEnv } from '@/config/auth';
import { fileEnv } from '@/config/file';
import { knowledgeEnv } from '@/config/knowledge';
import { langfuseEnv } from '@/config/langfuse';
import { enableNextAuth } from '@/const/auth';
import { isDesktop } from '@/const/version';
import { parseSystemAgent } from '@/server/globalConfig/parseSystemAgent';
import { SystemEmbeddingConfig } from '@/types/knowledgeBase';
import { GlobalServerConfig } from '@/types/serverConfig';
import { UserSystemAgentConfig } from '@/types/user/settings';
import { FilesConfigItem } from '@/types/user/settings/filesConfig';

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
  isDesktop: false,
}));

vi.mock('./parseSystemAgent', () => ({
  parseSystemAgent: vi.fn(),
}));

vi.mock('./genServerAiProviderConfig', () => ({
  genServerAiProvidersConfig: vi.fn(),
}));

vi.mock('./parseDefaultAgent', () => ({
  parseAgentConfig: vi.fn(),
}));

vi.mock('./parseFilesConfig', () => ({
  parseFilesConfig: vi.fn(),
}));

vi.mock('./_deprecated', () => ({
  genServerLLMConfig: vi.fn(() => ({})),
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
    const mockEmbeddingModel: FilesConfigItem = {
      model: 'test-model',
      provider: 'test-provider',
    };

    const mockRerankerModel: FilesConfigItem = {
      model: 'test-reranker',
      provider: 'test-provider',
    };

    const mockConfig: SystemEmbeddingConfig = {
      embeddingModel: mockEmbeddingModel,
      queryMode: 'hybrid',
      rerankerModel: mockRerankerModel,
    };

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
  });

  it('should return global config with correct provider settings', async () => {
    const mockAgentConfig = { key: 'value' };
    const mockSystemAgent: Partial<UserSystemAgentConfig> = {};
    const mockAiProviders = {
      qwen: {
        enabled: true,
        withDeploymentName: true,
      },
      ollama: {
        enabled: true,
        fetchOnClient: !process.env.OLLAMA_PROXY_URL,
      },
    };

    vi.mocked(parseAgentConfig).mockReturnValue(mockAgentConfig);
    vi.mocked(parseSystemAgent).mockReturnValue(mockSystemAgent);
    vi.mocked(genServerAiProvidersConfig).mockReturnValue(mockAiProviders);

    const result = await getServerGlobalConfig();

    expect(result).toMatchObject({
      aiProvider: mockAiProviders,
      defaultAgent: {
        config: mockAgentConfig,
      },
      enableUploadFileToServer: true,
      enabledAccessCode: true,
      enabledOAuthSSO: true,
      oAuthSSOProviders: ['github', 'google'],
      systemAgent: mockSystemAgent,
      telemetry: {
        langfuse: true,
      },
    });
  });

  it('should handle desktop mode correctly', async () => {
    vi.mock('@/const/version', () => ({
      isDesktop: true,
    }));

    const mockAiProviders = {
      ollama: {
        enabled: true,
        fetchOnClient: false,
      },
      qwen: {
        enabled: true,
        withDeploymentName: true,
      },
    };

    vi.mocked(genServerAiProvidersConfig).mockReturnValue(mockAiProviders);

    const result = await getServerGlobalConfig();

    expect(result.aiProvider).toEqual(mockAiProviders);
    expect(genServerAiProvidersConfig).toHaveBeenCalledWith(
      expect.objectContaining({
        ollama: {
          enabled: true,
          fetchOnClient: false,
        },
        qwen: {
          withDeploymentName: true,
        },
      }),
    );
  });

  it('should configure qwen provider with withDeploymentName', async () => {
    const mockAiProviders = {
      qwen: {
        enabled: true,
        withDeploymentName: true,
      },
    };

    vi.mocked(genServerAiProvidersConfig).mockReturnValue(mockAiProviders);

    const result = await getServerGlobalConfig();

    expect(result.aiProvider).toEqual(mockAiProviders);
    expect(genServerAiProvidersConfig).toHaveBeenCalledWith(
      expect.objectContaining({
        qwen: {
          withDeploymentName: true,
        },
      }),
    );
  });
});
