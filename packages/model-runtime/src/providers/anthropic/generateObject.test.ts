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
                name: 'structured_output',
                input: { name: 'John', age: 30 },
              },
            ],
          }),
        },
      };

      const payload = {
        messages: [{ content: 'Generate a person object', role: 'user' as const }],
        schema: {
          type: 'object',
          properties: { name: { type: 'string' }, age: { type: 'number' } },
        },
        model: 'claude-3-5-sonnet-20241022',
      };

      const result = await createAnthropicGenerateObject(mockClient as any, payload);

      expect(mockClient.messages.create).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 8192,
          messages: [
            { content: 'Generate a person object', role: 'user' },
            {
              content:
                'Please use the structured_output tool to provide your response in the required format.',
              role: 'user',
            },
          ],
          tools: [
            {
              name: 'structured_output',
              description: 'Generate structured output according to the provided schema',
              input_schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  age: { type: 'number' },
                },
              },
            },
          ],
          tool_choice: {
            type: 'tool',
            name: 'structured_output',
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
                name: 'structured_output',
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
        schema: { type: 'object', properties: { status: { type: 'string' } } },
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
                name: 'structured_output',
                input: { data: 'test' },
              },
            ],
          }),
        },
      };

      const payload = {
        messages: [{ content: 'Generate data', role: 'user' as const }],
        schema: { type: 'object', properties: { data: { type: 'string' } } },
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

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const payload = {
        messages: [{ content: 'Generate data', role: 'user' as const }],
        schema: { type: 'object' },
        model: 'claude-3-5-sonnet-20241022',
      };

      const result = await createAnthropicGenerateObject(mockClient as any, payload);

      expect(consoleSpy).toHaveBeenCalledWith('No structured output tool use found in response');
      expect(result).toBeUndefined();

      consoleSpy.mockRestore();
    });

    it('should handle complex nested schemas', async () => {
      const mockClient = {
        messages: {
          create: vi.fn().mockResolvedValue({
            content: [
              {
                type: 'tool_use',
                name: 'structured_output',
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
          type: 'object',
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
        schema: { type: 'object' },
        model: 'claude-3-5-sonnet-20241022',
      };

      await expect(createAnthropicGenerateObject(mockClient as any, payload)).rejects.toThrow(
        'API Error: Model not found',
      );
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
        schema: { type: 'object' },
        model: 'claude-3-5-sonnet-20241022',
      };

      const options = {
        signal: new AbortController().signal,
      };

      await expect(
        createAnthropicGenerateObject(mockClient as any, payload, options),
      ).rejects.toThrow();
    });
  });
});
