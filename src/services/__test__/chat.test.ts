import { beforeEach, describe, expect, it, vi } from 'vitest';

import { INBOX_SESSION_ID } from '@/const/session';
import { TraceTagMap } from '@/const/trace';
import { AgentRuntime } from '@/libs/agent-runtime';
import { useAiInfraStore } from '@/store/aiInfra';
import { useSessionStore } from '@/store/session';
import { useToolStore } from '@/store/tool';
import { useUserStore } from '@/store/user';
import { ChatMessage } from '@/types/message';
import { OpenAIChatMessage } from '@/types/openai/chat';

import { chatService, initializeWithClientStore } from '../chat';

vi.mock('@/libs/agent-runtime');
vi.mock('@/store/aiInfra');
vi.mock('@/store/tool');
vi.mock('@/store/user');
vi.mock('@/store/session');

describe('chat service', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    (useUserStore.getState as any).mockReturnValue({
      settings: {
        defaultSettings: {
          keyVaults: {},
        },
      },
      preference: {
        allowTrace: true,
      },
      profile: {
        userId: 'test-user',
      },
      isSignedIn: true,
    });

    (useAiInfraStore.getState as any).mockReturnValue({
      enabledAiModels: [
        {
          id: 'gpt-3.5-turbo',
          providerId: 'openai',
          config: {},
        },
      ],
    });

    (useToolStore.getState as any).mockReturnValue({
      enabledPlugins: ['test-plugin'],
      plugins: {
        'test-plugin': {
          manifest: {
            identifier: 'test-plugin',
            api: [{ name: 'test' }],
            gateway: '/webapi/plugin/gateway',
          },
          settings: {},
        },
      },
      installedPlugins: [
        {
          identifier: 'test-plugin',
          manifest: {
            identifier: 'test-plugin',
            api: [{ name: 'test' }],
          },
          settings: {},
        },
      ],
    });

    (useSessionStore.getState as any).mockReturnValue({
      sessions: {
        [INBOX_SESSION_ID]: {
          meta: {
            tags: ['test-tag'],
          },
        },
      },
    });

    vi.mocked(AgentRuntime.initializeWithProvider).mockResolvedValue({} as any);
  });

  describe('initializeWithClientStore', () => {
    it('should initialize agent runtime with merged options', () => {
      const provider = 'openai';
      const payload = { apiKey: 'test-key' };

      initializeWithClientStore(provider, payload);

      expect(AgentRuntime.initializeWithProvider).toHaveBeenCalledWith(provider, {
        dangerouslyAllowBrowser: true,
        apiKey: 'test-key',
      });
    });
  });

  describe('runPluginApi', () => {
    it('should call plugin API with correct headers', async () => {
      const mockFetch = vi.spyOn(global, 'fetch').mockResolvedValue(
        new Response('test', {
          headers: {
            'X-lobe-chat-trace-id': 'test-trace-id',
          },
        }),
      );

      const result = await chatService.runPluginApi({
        identifier: 'test-plugin',
        apiName: 'test',
        arguments: '{}',
      });

      expect(mockFetch).toHaveBeenCalledWith(
        '/webapi/plugin/gateway',
        expect.objectContaining({
          method: 'POST',
          headers: expect.any(Object),
        }),
      );

      expect(result).toEqual({
        text: 'test',
        traceId: 'test-trace-id',
      });

      mockFetch.mockRestore();
    });

    it('should handle API errors', async () => {
      const mockFetch = vi.spyOn(global, 'fetch').mockResolvedValue(
        new Response('Error', {
          status: 400,
        }),
      );

      await expect(
        chatService.runPluginApi({
          identifier: 'test-plugin',
          apiName: 'test',
          arguments: '{}',
        }),
      ).rejects.toThrow();

      mockFetch.mockRestore();
    });
  });

  describe('reorderToolMessages', () => {
    it('should reorder tool messages correctly', () => {
      const messages: OpenAIChatMessage[] = [
        {
          role: 'assistant',
          content: 'Let me help',
          tool_calls: [
            { id: 'tool1', type: 'function', function: { name: 'test', arguments: '{}' } },
          ],
        },
        {
          role: 'tool',
          content: 'result',
          tool_call_id: 'tool1',
        },
      ];

      const reordered = chatService['reorderToolMessages'](messages);

      expect(reordered).toHaveLength(2);
      expect(reordered[0].role).toBe('assistant');
      expect(reordered[1].role).toBe('tool');
      expect(reordered[1].tool_call_id).toBe('tool1');
    });

    it('should skip invalid tool messages', () => {
      const messages: OpenAIChatMessage[] = [
        {
          role: 'assistant',
          content: 'Let me help',
          tool_calls: [
            { id: 'tool1', type: 'function', function: { name: 'test', arguments: '{}' } },
          ],
        },
        {
          role: 'tool',
          content: 'result',
          tool_call_id: 'invalid-id',
        },
      ];

      const reordered = chatService['reorderToolMessages'](messages);

      expect(reordered).toHaveLength(1);
      expect(reordered[0].role).toBe('assistant');
    });
  });
});
