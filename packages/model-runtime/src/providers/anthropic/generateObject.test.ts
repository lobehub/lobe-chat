// @vitest-environment edge-runtime
import { describe, expect, it, vi } from 'vitest';

import { createAnthropicGenerateObject } from './generateObject';

describe('Anthropic generateObject', () => {
  describe('createAnthropicGenerateObject', () => {
    it('should return structured data on successful API call', async () => {
      const mockClient = {
        messages: {
          create: vi.fn().mockResolvedValue({
            content: [
              {
                type: 'tool_use',
                name: 'person_extractor',
                input: { name: 'John', age: 30 },
              },
            ],
          }),
        },
      };

      const payload = {
        messages: [{ content: 'Generate a person object', role: 'user' as const }],
        schema: {
          name: 'person_extractor',
          description: 'Extract person information',
          schema: {
            type: 'object' as const,
            properties: { name: { type: 'string' }, age: { type: 'number' } },
            required: ['name', 'age'],
          },
        },
        model: 'claude-3-5-sonnet-20241022',
      };

      const result = await createAnthropicGenerateObject(mockClient as any, payload);

      expect(mockClient.messages.create).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 8192,
          messages: [{ content: 'Generate a person object', role: 'user' }],
          tools: [
            {
              name: 'person_extractor',
              description: 'Extract person information',
              input_schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  age: { type: 'number' },
                },
                required: ['name', 'age'],
              },
            },
          ],
          tool_choice: {
            type: 'tool',
            name: 'person_extractor',
          },
        }),
        expect.objectContaining({}),
      );

      expect(result).toEqual({ name: 'John', age: 30 });
    });

    it('should handle system messages correctly', async () => {
      const mockClient = {
        messages: {
          create: vi.fn().mockResolvedValue({
            content: [
              {
                type: 'tool_use',
                name: 'status_extractor',
                input: { status: 'success' },
              },
            ],
          }),
        },
      };

      const payload = {
        messages: [
          { content: 'You are a helpful assistant', role: 'system' as const },
          { content: 'Generate status', role: 'user' as const },
        ],
        schema: {
          name: 'status_extractor',
          schema: { type: 'object' as const, properties: { status: { type: 'string' } } },
        },
        model: 'claude-3-5-sonnet-20241022',
      };

      const result = await createAnthropicGenerateObject(mockClient as any, payload);

      expect(mockClient.messages.create).toHaveBeenCalledWith(
        expect.objectContaining({
          system: [{ text: 'You are a helpful assistant', type: 'text' }],
          messages: expect.any(Array),
        }),
        expect.any(Object),
      );

      expect(result).toEqual({ status: 'success' });
    });

    it('should handle options correctly', async () => {
      const mockClient = {
        messages: {
          create: vi.fn().mockResolvedValue({
            content: [
              {
                type: 'tool_use',
                name: 'data_extractor',
                input: { data: 'test' },
              },
            ],
          }),
        },
      };

      const payload = {
        messages: [{ content: 'Generate data', role: 'user' as const }],
        schema: {
          name: 'data_extractor',
          schema: { type: 'object' as const, properties: { data: { type: 'string' } } },
        },
        model: 'claude-3-5-sonnet-20241022',
      };

      const options = {
        signal: new AbortController().signal,
      };

      const result = await createAnthropicGenerateObject(mockClient as any, payload, options);

      expect(mockClient.messages.create).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          signal: options.signal,
        }),
      );

      expect(result).toEqual({ data: 'test' });
    });

    it('should return undefined when no tool use found in response', async () => {
      const mockClient = {
        messages: {
          create: vi.fn().mockResolvedValue({
            content: [
              {
                type: 'text',
                text: 'Some text response without tool use',
              },
            ],
          }),
        },
      };

      const payload = {
        messages: [{ content: 'Generate data', role: 'user' as const }],
        schema: {
          name: 'test_tool',
          schema: { type: 'object' },
        },
        model: 'claude-3-5-sonnet-20241022',
      };

      const result = await createAnthropicGenerateObject(mockClient as any, payload as any);

      expect(result).toBeUndefined();
    });

    it('should handle complex nested schemas', async () => {
      const mockClient = {
        messages: {
          create: vi.fn().mockResolvedValue({
            content: [
              {
                type: 'tool_use',
                name: 'user_extractor',
                input: {
                  user: {
                    name: 'Alice',
                    profile: {
                      age: 25,
                      preferences: ['music', 'sports'],
                    },
                  },
                  metadata: {
                    created: '2024-01-01',
                  },
                },
              },
            ],
          }),
        },
      };

      const payload = {
        messages: [{ content: 'Generate complex user data', role: 'user' as const }],
        schema: {
          name: 'user_extractor',
          description: 'Extract complex user information',
          schema: {
            type: 'object' as const,
            properties: {
              user: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  profile: {
                    type: 'object',
                    properties: {
                      age: { type: 'number' },
                      preferences: { type: 'array', items: { type: 'string' } },
                    },
                  },
                },
              },
              metadata: { type: 'object' },
            },
          },
        },
        model: 'claude-3-5-sonnet-20241022',
      };

      const result = await createAnthropicGenerateObject(mockClient as any, payload);

      expect(result).toEqual({
        user: {
          name: 'Alice',
          profile: {
            age: 25,
            preferences: ['music', 'sports'],
          },
        },
        metadata: {
          created: '2024-01-01',
        },
      });
    });

    it('should propagate API errors correctly', async () => {
      const apiError = new Error('API Error: Model not found');

      const mockClient = {
        messages: {
          create: vi.fn().mockRejectedValue(apiError),
        },
      };

      const payload = {
        messages: [{ content: 'Generate data', role: 'user' as const }],
        schema: {
          name: 'test_tool',
          schema: { type: 'object' },
        },
        model: 'claude-3-5-sonnet-20241022',
      };

      await expect(
        createAnthropicGenerateObject(mockClient as any, payload as any),
      ).rejects.toThrow('API Error: Model not found');
    });

    it('should handle abort signals correctly', async () => {
      const apiError = new Error('Request was cancelled');
      apiError.name = 'AbortError';

      const mockClient = {
        messages: {
          create: vi.fn().mockRejectedValue(apiError),
        },
      };

      const payload = {
        messages: [{ content: 'Generate data', role: 'user' as const }],
        schema: {
          name: 'test_tool',
          schema: { type: 'object' },
        },
        model: 'claude-3-5-sonnet-20241022',
      };

      const options = {
        signal: new AbortController().signal,
      };

      await expect(
        createAnthropicGenerateObject(mockClient as any, payload as any, options),
      ).rejects.toThrow();
    });
  });
});
