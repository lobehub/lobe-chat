// @vitest-environment edge-runtime
import { describe, expect, it, vi } from 'vitest';

import { createAnthropicGenerateObject } from './generateObject';

describe('Anthropic generateObject', () => {
  it('should throw error when neither tools nor schema is provided', async () => {
    const mockClient = {
      messages: {
        create: vi.fn(),
      },
    };

    const payload = {
      messages: [{ content: 'Generate data', role: 'user' as const }],
      model: 'claude-3-5-sonnet-20241022',
    };

    await expect(createAnthropicGenerateObject(mockClient as any, payload as any)).rejects.toThrow(
      'tools or schema is required',
    );
  });

  describe('use struct output schema', () => {
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
  });

  describe('tools calling', () => {
    it('should handle tools calling mode with multiple tools', async () => {
      const mockClient = {
        messages: {
          create: vi.fn().mockResolvedValue({
            content: [
              {
                type: 'tool_use',
                name: 'get_weather',
                input: { city: 'New York', unit: 'celsius' },
              },
              {
                type: 'tool_use',
                name: 'get_time',
                input: { timezone: 'America/New_York' },
              },
            ],
          }),
        },
      };

      const payload = {
        messages: [{ content: 'What is the weather and time in New York?', role: 'user' as const }],
        tools: [
          {
            name: 'get_weather',
            description: 'Get weather information',
            parameters: {
              type: 'object' as const,
              properties: {
                city: { type: 'string' },
                unit: { type: 'string' },
              },
              required: ['city'],
            },
          },
          {
            name: 'get_time',
            description: 'Get current time',
            parameters: {
              type: 'object' as const,
              properties: {
                timezone: { type: 'string' },
              },
              required: ['timezone'],
            },
          },
        ],
        model: 'claude-3-5-sonnet-20241022',
      };

      const result = await createAnthropicGenerateObject(mockClient as any, payload as any);

      expect(mockClient.messages.create).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 8192,
          messages: [{ content: 'What is the weather and time in New York?', role: 'user' }],
          tools: [
            {
              name: 'get_weather',
              description: 'Get weather information',
              input_schema: {
                type: 'object',
                properties: {
                  city: { type: 'string' },
                  unit: { type: 'string' },
                },
                required: ['city'],
              },
            },
            {
              name: 'get_time',
              description: 'Get current time',
              input_schema: {
                type: 'object',
                properties: {
                  timezone: { type: 'string' },
                },
                required: ['timezone'],
              },
            },
          ],
          tool_choice: {
            type: 'any',
          },
        }),
        expect.objectContaining({}),
      );

      expect(result).toEqual([
        { arguments: { city: 'New York', unit: 'celsius' }, name: 'get_weather' },
        { arguments: { timezone: 'America/New_York' }, name: 'get_time' },
      ]);
    });

    it('should handle tools calling mode with single tool', async () => {
      const mockClient = {
        messages: {
          create: vi.fn().mockResolvedValue({
            content: [
              {
                type: 'tool_use',
                name: 'calculate',
                input: { operation: 'add', a: 5, b: 3 },
              },
            ],
          }),
        },
      };

      const payload = {
        messages: [{ content: 'Add 5 and 3', role: 'user' as const }],
        tools: [
          {
            name: 'calculate',
            description: 'Perform mathematical calculation',
            parameters: {
              type: 'object' as const,
              properties: {
                operation: { type: 'string' },
                a: { type: 'number' },
                b: { type: 'number' },
              },
              required: ['operation', 'a', 'b'],
            },
          },
        ],
        model: 'claude-3-5-sonnet-20241022',
      };

      const result = await createAnthropicGenerateObject(mockClient as any, payload as any);

      expect(result).toEqual([{ arguments: { operation: 'add', a: 5, b: 3 }, name: 'calculate' }]);
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

    await expect(createAnthropicGenerateObject(mockClient as any, payload as any)).rejects.toThrow(
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
