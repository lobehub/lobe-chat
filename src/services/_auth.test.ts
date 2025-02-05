import { describe, expect, it, vi } from 'vitest';

import { ModelProvider } from '@/libs/agent-runtime';
import { aiProviderSelectors, useAiInfraStore } from '@/store/aiInfra';
import { useUserStore } from '@/store/user';
import { keyVaultsConfigSelectors, userProfileSelectors } from '@/store/user/selectors';
import { createJWT } from '@/utils/jwt';

import { createAuthTokenWithPayload, createHeaderWithAuth, getProviderAuthPayload } from './_auth';

vi.mock('@/store/aiInfra', () => ({
  aiProviderSelectors: {
    providerKeyVaults: vi.fn().mockImplementation(() => () => ({})),
  },
  useAiInfraStore: {
    getState: vi.fn(),
  },
}));
vi.mock('@/store/user');
vi.mock('@/store/user/selectors');
vi.mock('@/utils/jwt');
vi.mock('@/const/version', () => ({
  isDeprecatedEdition: true,
}));

describe('getProviderAuthPayload', () => {
  it('should return correct payload for Bedrock provider', () => {
    const keyVaults = {
      accessKeyId: 'accessKeyId',
      apiKey: 'apiKey',
      region: 'us-east-1',
      secretAccessKey: 'secretAccessKey',
      sessionToken: 'sessionToken',
    };

    const result = getProviderAuthPayload(ModelProvider.Bedrock, keyVaults);

    expect(result).toEqual({
      accessKeyId: 'accessKeyId',
      accessKeySecret: 'secretAccessKey',
      apiKey: 'secretAccessKeyaccessKeyId',
      awsAccessKeyId: 'accessKeyId',
      awsRegion: 'us-east-1',
      awsSecretAccessKey: 'secretAccessKey',
      awsSessionToken: 'sessionToken',
      region: 'us-east-1',
      sessionToken: 'sessionToken',
    });
  });

  it('should return correct payload for Azure provider', () => {
    const keyVaults = {
      apiKey: 'apiKey',
      apiVersion: '2023-05-15',
      baseURL: 'https://azure.com',
      endpoint: 'endpoint',
    };

    const result = getProviderAuthPayload(ModelProvider.Azure, keyVaults);

    expect(result).toEqual({
      apiKey: 'apiKey',
      apiVersion: '2023-05-15',
      azureApiVersion: '2023-05-15',
      baseURL: 'https://azure.com',
    });
  });

  it('should use endpoint as baseURL if baseURL is not provided for Azure', () => {
    const keyVaults = {
      apiKey: 'apiKey',
      apiVersion: '2023-05-15',
      endpoint: 'endpoint',
    };

    const result = getProviderAuthPayload(ModelProvider.Azure, keyVaults);

    expect(result.baseURL).toBe('endpoint');
  });

  it('should return correct payload for Ollama provider', () => {
    const keyVaults = {
      baseURL: 'http://localhost:11434',
    };

    const result = getProviderAuthPayload(ModelProvider.Ollama, keyVaults);

    expect(result).toEqual({
      baseURL: 'http://localhost:11434',
    });
  });

  it('should return correct payload for Cloudflare provider', () => {
    const keyVaults = {
      apiKey: 'apiKey',
      baseURLOrAccountID: 'accountId',
    };

    const result = getProviderAuthPayload(ModelProvider.Cloudflare, keyVaults);

    expect(result).toEqual({
      apiKey: 'apiKey',
      baseURLOrAccountID: 'accountId',
      cloudflareBaseURLOrAccountID: 'accountId',
    });
  });

  it('should return default payload for unknown provider', () => {
    const keyVaults = {
      apiKey: 'apiKey',
      baseURL: 'baseURL',
    };

    const result = getProviderAuthPayload('unknown', keyVaults);

    expect(result).toEqual({
      apiKey: 'apiKey',
      baseURL: 'baseURL',
    });
  });
});

describe('createAuthTokenWithPayload', () => {
  it('should create JWT token with payload', async () => {
    const mockPassword = 'password';
    const mockUserId = 'userId';
    const mockPayload = { test: 'test' };

    vi.mocked(keyVaultsConfigSelectors.password).mockReturnValue(mockPassword);
    vi.mocked(userProfileSelectors.userId).mockReturnValue(mockUserId);
    vi.mocked(useUserStore.getState).mockReturnValue({} as any);
    vi.mocked(createJWT).mockResolvedValue('token');

    const result = await createAuthTokenWithPayload(mockPayload);

    expect(createJWT).toHaveBeenCalledWith({
      accessCode: mockPassword,
      userId: mockUserId,
      test: 'test',
    });
    expect(result).toBe('token');
  });

  it('should create JWT token with empty payload', async () => {
    vi.mocked(keyVaultsConfigSelectors.password).mockReturnValue('password');
    vi.mocked(userProfileSelectors.userId).mockReturnValue('userId');
    vi.mocked(createJWT).mockResolvedValue('token');

    const result = await createAuthTokenWithPayload();

    expect(createJWT).toHaveBeenCalledWith({
      accessCode: 'password',
      userId: 'userId',
    });
    expect(result).toBe('token');
  });
});

describe('createHeaderWithAuth', () => {
  it('should create headers with auth token', async () => {
    const mockToken = 'token';
    vi.mocked(createJWT).mockResolvedValue(mockToken);

    const result = await createHeaderWithAuth({
      headers: { 'Content-Type': 'application/json' },
    });

    expect(result).toEqual({
      'Content-Type': 'application/json',
      'X-lobe-chat-auth': mockToken,
    });
  });

  it('should include provider payload in auth token for deprecated edition', async () => {
    const mockToken = 'token';
    const mockVaults = { apiKey: 'test-key' };
    vi.mocked(createJWT).mockResolvedValue(mockToken);
    vi.mocked(keyVaultsConfigSelectors.getVaultByProvider).mockReturnValue(() => mockVaults);
    vi.mocked(useUserStore.getState).mockReturnValue({} as any);

    const result = await createHeaderWithAuth({
      provider: ModelProvider.Azure,
      payload: { customField: 'value' },
    });

    expect(result).toEqual({
      'X-lobe-chat-auth': mockToken,
    });
  });

  it('should use AI infra store for non-deprecated edition', async () => {
    vi.mock('@/const/version', () => ({
      isDeprecatedEdition: false,
    }));

    const mockToken = 'token';
    const mockVaults = { apiKey: 'test-key' };

    vi.mocked(createJWT).mockResolvedValue(mockToken);
    vi.mocked(useAiInfraStore.getState).mockReturnValue({} as any);
    vi.mocked(aiProviderSelectors.providerKeyVaults).mockImplementation(() => () => mockVaults);

    const result = await createHeaderWithAuth({
      provider: ModelProvider.Azure,
    });

    expect(result).toEqual({
      'X-lobe-chat-auth': mockToken,
    });
  });
});
