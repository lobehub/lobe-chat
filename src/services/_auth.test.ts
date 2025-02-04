import { describe, expect, it, vi } from 'vitest';

import { LOBE_CHAT_AUTH_HEADER } from '@/const/auth';
import { isDeprecatedEdition } from '@/const/version';
import { ModelProvider } from '@/libs/agent-runtime';
import { aiProviderSelectors, useAiInfraStore } from '@/store/aiInfra';
import { useUserStore } from '@/store/user';
import { keyVaultsConfigSelectors, userProfileSelectors } from '@/store/user/selectors';
import { createJWT } from '@/utils/jwt';

import { createAuthTokenWithPayload, createHeaderWithAuth, getProviderAuthPayload } from './_auth';

vi.mock('@/utils/jwt', () => ({
  createJWT: vi.fn(),
}));

vi.mock('@/const/version', () => ({
  isDeprecatedEdition: true,
}));

vi.mock('@/store/user', () => ({
  useUserStore: {
    getState: vi.fn(),
  },
}));

vi.mock('@/store/user/selectors', () => ({
  keyVaultsConfigSelectors: {
    password: vi.fn(),
    getVaultByProvider: vi.fn(),
  },
  userProfileSelectors: {
    userId: vi.fn(),
  },
}));

vi.mock('@/store/aiInfra', () => ({
  useAiInfraStore: {
    getState: vi.fn(),
  },
  aiProviderSelectors: {
    providerKeyVaults: vi.fn(),
  },
}));

describe('auth', () => {
  describe('getProviderAuthPayload', () => {
    it('should handle Bedrock provider', () => {
      const keyVaults = {
        accessKeyId: 'testAccessKeyId',
        region: 'us-east-1',
        secretAccessKey: 'testSecretKey',
        sessionToken: 'testSessionToken',
      };

      const result = getProviderAuthPayload(ModelProvider.Bedrock, keyVaults);

      expect(result).toEqual({
        accessKeyId: 'testAccessKeyId',
        accessKeySecret: 'testSecretKey',
        apiKey: 'testSecretKeytestAccessKeyId',
        awsAccessKeyId: 'testAccessKeyId',
        awsRegion: 'us-east-1',
        awsSecretAccessKey: 'testSecretKey',
        awsSessionToken: 'testSessionToken',
        region: 'us-east-1',
        sessionToken: 'testSessionToken',
      });
    });

    it('should handle Azure provider', () => {
      const keyVaults = {
        apiKey: 'testApiKey',
        apiVersion: '2023-05-15',
        baseURL: 'https://azure-endpoint.com',
      };

      const result = getProviderAuthPayload(ModelProvider.Azure, keyVaults);

      expect(result).toEqual({
        apiKey: 'testApiKey',
        apiVersion: '2023-05-15',
        azureApiVersion: '2023-05-15',
        baseURL: 'https://azure-endpoint.com',
      });
    });

    it('should handle Azure provider with endpoint instead of baseURL', () => {
      const keyVaults = {
        apiKey: 'testApiKey',
        apiVersion: '2023-05-15',
        endpoint: 'https://azure-endpoint.com',
      };

      const result = getProviderAuthPayload(ModelProvider.Azure, keyVaults);

      expect(result).toEqual({
        apiKey: 'testApiKey',
        apiVersion: '2023-05-15',
        azureApiVersion: '2023-05-15',
        baseURL: 'https://azure-endpoint.com',
      });
    });

    it('should handle Ollama provider', () => {
      const keyVaults = {
        baseURL: 'http://localhost:11434',
      };

      const result = getProviderAuthPayload(ModelProvider.Ollama, keyVaults);

      expect(result).toEqual({
        baseURL: 'http://localhost:11434',
      });
    });

    it('should handle Cloudflare provider', () => {
      const keyVaults = {
        apiKey: 'testApiKey',
        baseURLOrAccountID: 'testAccountId',
      };

      const result = getProviderAuthPayload(ModelProvider.Cloudflare, keyVaults);

      expect(result).toEqual({
        apiKey: 'testApiKey',
        baseURLOrAccountID: 'testAccountId',
        cloudflareBaseURLOrAccountID: 'testAccountId',
      });
    });

    it('should handle default provider', () => {
      const keyVaults = {
        apiKey: 'testApiKey',
        baseURL: 'https://api.example.com',
      };

      const result = getProviderAuthPayload('unknown', keyVaults);

      expect(result).toEqual({
        apiKey: 'testApiKey',
        baseURL: 'https://api.example.com',
      });
    });
  });

  describe('createAuthTokenWithPayload', () => {
    it('should create auth token with payload', async () => {
      const mockPassword = 'test-password';
      const mockUserId = 'test-user-id';
      const mockState = {} as any;

      vi.mocked(createJWT).mockResolvedValue('mock-jwt-token');
      vi.mocked(useUserStore.getState).mockReturnValue(mockState);
      vi.mocked(keyVaultsConfigSelectors.password).mockImplementation(() => mockPassword);
      vi.mocked(userProfileSelectors.userId).mockImplementation(() => mockUserId);

      const payload = { test: 'data' };
      await createAuthTokenWithPayload(payload);

      expect(createJWT).toHaveBeenCalledWith({
        accessCode: mockPassword,
        userId: mockUserId,
        test: 'data',
      });
    });
  });

  describe('createHeaderWithAuth', () => {
    beforeEach(() => {
      vi.mocked(createJWT).mockResolvedValue('mock-jwt-token');
      vi.mocked(useAiInfraStore.getState).mockReturnValue({} as any);
      vi.mocked(aiProviderSelectors.providerKeyVaults).mockImplementation(() => () => ({
        apiKey: 'test-api-key',
      }));
      vi.mocked(keyVaultsConfigSelectors.getVaultByProvider).mockImplementation(() => () => ({
        apiKey: 'test-api-key',
      }));
    });

    it('should create headers with auth token', async () => {
      const headers = await createHeaderWithAuth();

      expect(headers).toEqual({
        [LOBE_CHAT_AUTH_HEADER]: 'mock-jwt-token',
      });
    });

    it('should include existing headers', async () => {
      const existingHeaders = {
        'Content-Type': 'application/json',
      };

      const headers = await createHeaderWithAuth({ headers: existingHeaders });

      expect(headers).toEqual({
        'Content-Type': 'application/json',
        [LOBE_CHAT_AUTH_HEADER]: 'mock-jwt-token',
      });
    });

    it('should include provider payload', async () => {
      const headers = await createHeaderWithAuth({
        provider: 'openai',
        payload: { custom: 'value' },
      });

      expect(headers).toEqual({
        [LOBE_CHAT_AUTH_HEADER]: 'mock-jwt-token',
      });

      expect(keyVaultsConfigSelectors.getVaultByProvider).toHaveBeenCalledWith('openai');
    });
  });
});
