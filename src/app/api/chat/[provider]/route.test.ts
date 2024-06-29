// @vitest-environment node
import { getAuth } from '@clerk/nextjs/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { checkAuthMethod, getJWTPayload } from '@/app/api/middleware/auth/utils';
import { LOBE_CHAT_AUTH_HEADER, OAUTH_AUTHORIZED } from '@/const/auth';
import { AgentRuntime, LobeRuntimeAI } from '@/libs/agent-runtime';
import { ChatErrorType } from '@/types/fetch';

import { POST } from './route';

vi.mock('@clerk/nextjs/server', () => ({
  getAuth: vi.fn(),
}));

vi.mock('../../middleware/auth/utils', () => ({
  getJWTPayload: vi.fn(),
  checkAuthMethod: vi.fn(),
}));

// 定义一个变量来存储 enableAuth 的值
let enableClerk = false;

// 模拟 @/const/auth 模块
vi.mock('@/const/auth', async (importOriginal) => {
  const modules = await importOriginal();
  return {
    ...(modules as any),
    get enableClerk() {
      return enableClerk;
    },
  };
});

// 模拟请求和响应
let request: Request;
beforeEach(() => {
  request = new Request(new URL('https://test.com'), {
    headers: {
      [LOBE_CHAT_AUTH_HEADER]: 'Bearer some-valid-token',
      [OAUTH_AUTHORIZED]: 'true',
    },
    method: 'POST',
    body: JSON.stringify({ model: 'test-model' }),
  });
});

afterEach(() => {
  // 清除模拟调用历史
  vi.clearAllMocks();
  enableClerk = false;
});

describe('POST handler', () => {
  describe('init chat model', () => {
    it('should initialize AgentRuntime correctly with valid authorization', async () => {
      const mockParams = { provider: 'test-provider' };

      // 设置 getJWTPayload 和 initAgentRuntimeWithUserPayload 的模拟返回值
      vi.mocked(getJWTPayload).mockResolvedValueOnce({
        accessCode: 'test-access-code',
        apiKey: 'test-api-key',
        azureApiVersion: 'v1',
      });

      const mockRuntime: LobeRuntimeAI = { baseURL: 'abc', chat: vi.fn() };

      // migrate to new AgentRuntime init api
      const spy = vi
        .spyOn(AgentRuntime, 'initializeWithProviderOptions')
        .mockResolvedValue(new AgentRuntime(mockRuntime));

      // 调用 POST 函数
      await POST(request as unknown as Request, { params: mockParams });

      // 验证是否正确调用了模拟函数
      expect(getJWTPayload).toHaveBeenCalledWith('Bearer some-valid-token');
      expect(spy).toHaveBeenCalledWith('test-provider', expect.anything());
    });

    it('should return Unauthorized error when LOBE_CHAT_AUTH_HEADER is missing', async () => {
      const mockParams = { provider: 'test-provider' };
      const requestWithoutAuthHeader = new Request(new URL('https://test.com'), {
        method: 'POST',
        body: JSON.stringify({ model: 'test-model' }),
      });

      const response = await POST(requestWithoutAuthHeader, { params: mockParams });

      expect(response.status).toBe(401);
      expect(await response.json()).toEqual({
        body: {
          error: { errorType: 401 },
          provider: 'test-provider',
        },
        errorType: 401,
      });
    });

    it('should have pass clerk Auth when enable clerk', async () => {
      enableClerk = true;

      vi.mocked(getJWTPayload).mockResolvedValueOnce({
        accessCode: 'test-access-code',
        apiKey: 'test-api-key',
        azureApiVersion: 'v1',
      });

      const mockParams = { provider: 'test-provider' };
      // 设置 initAgentRuntimeWithUserPayload 的模拟返回值
      vi.mocked(getAuth).mockReturnValue({} as any);
      vi.mocked(checkAuthMethod).mockReset();

      const mockRuntime: LobeRuntimeAI = { baseURL: 'abc', chat: vi.fn() };

      vi.spyOn(AgentRuntime, 'initializeWithProviderOptions').mockResolvedValue(
        new AgentRuntime(mockRuntime),
      );

      const request = new Request(new URL('https://test.com'), {
        method: 'POST',
        body: JSON.stringify({ model: 'test-model' }),
        headers: {
          [LOBE_CHAT_AUTH_HEADER]: 'some-valid-token',
          [OAUTH_AUTHORIZED]: '1',
        },
      });

      await POST(request, { params: mockParams });

      expect(checkAuthMethod).toBeCalledWith({
        accessCode: 'test-access-code',
        apiKey: 'test-api-key',
        clerkAuth: {},
        nextAuthAuthorized: true,
      });
    });

    it('should return InternalServerError error when throw a unknown error', async () => {
      const mockParams = { provider: 'test-provider' };
      vi.mocked(getJWTPayload).mockRejectedValueOnce(new Error('unknown error'));

      const response = await POST(request, { params: mockParams });

      expect(response.status).toBe(500);
      expect(await response.json()).toEqual({
        body: {
          error: {},
          provider: 'test-provider',
        },
        errorType: 500,
      });
    });
  });

  describe('chat', () => {
    it('should correctly handle chat completion with valid payload', async () => {
      vi.mocked(getJWTPayload).mockResolvedValueOnce({
        accessCode: 'test-access-code',
        apiKey: 'test-api-key',
        azureApiVersion: 'v1',
        userId: 'abc',
      });

      const mockParams = { provider: 'test-provider' };
      const mockChatPayload = { message: 'Hello, world!' };
      request = new Request(new URL('https://test.com'), {
        headers: { [LOBE_CHAT_AUTH_HEADER]: 'Bearer some-valid-token' },
        method: 'POST',
        body: JSON.stringify(mockChatPayload),
      });

      const mockChatResponse: any = { success: true, message: 'Reply from agent' };

      vi.spyOn(AgentRuntime.prototype, 'chat').mockResolvedValue(mockChatResponse);

      const response = await POST(request as unknown as Request, { params: mockParams });

      expect(response).toEqual(mockChatResponse);
      expect(AgentRuntime.prototype.chat).toHaveBeenCalledWith(mockChatPayload, { user: 'abc' });
    });

    it('should return an error response when chat completion fails', async () => {
      // 设置 getJWTPayload 和 initAgentRuntimeWithUserPayload 的模拟返回值
      vi.mocked(getJWTPayload).mockResolvedValueOnce({
        accessCode: 'test-access-code',
        apiKey: 'test-api-key',
        azureApiVersion: 'v1',
      });

      const mockParams = { provider: 'test-provider' };
      const mockChatPayload = { message: 'Hello, world!' };
      request = new Request(new URL('https://test.com'), {
        headers: { [LOBE_CHAT_AUTH_HEADER]: 'Bearer some-valid-token' },
        method: 'POST',
        body: JSON.stringify(mockChatPayload),
      });

      const mockErrorResponse = {
        errorType: ChatErrorType.InternalServerError,
        errorMessage: 'Something went wrong',
      };

      vi.spyOn(AgentRuntime.prototype, 'chat').mockRejectedValue(mockErrorResponse);

      const response = await POST(request, { params: mockParams });

      expect(response.status).toBe(500);
      expect(await response.json()).toEqual({
        body: {
          errorMessage: 'Something went wrong',
          error: {
            errorMessage: 'Something went wrong',
            errorType: 500,
          },
          provider: 'test-provider',
        },
        errorType: 500,
      });
    });
  });
});
