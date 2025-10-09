// @vitest-environment edge-runtime
import { Type as SchemaType } from '@google/genai';
import { describe, expect, it, vi } from 'vitest';

import { convertOpenAISchemaToGoogleSchema, createGoogleGenerateObject } from './generateObject';

describe('Google generateObject', () => {
  describe('convertOpenAISchemaToGoogleSchema', () => {
    it('should convert basic types correctly', () => {
      const openAISchema = {
        type: 'object',
        properties: {
          name: { type: 'string' },
          age: { type: 'number' },
          isActive: { type: 'boolean' },
          count: { type: 'integer' },
        },
      };

      const result = convertOpenAISchemaToGoogleSchema(openAISchema);

      expect(result).toEqual({
        type: SchemaType.OBJECT,
        properties: {
          name: { type: SchemaType.STRING },
          age: { type: SchemaType.NUMBER },
          isActive: { type: SchemaType.BOOLEAN },
          count: { type: SchemaType.INTEGER },
        },
      });
    });

    it('should convert array schemas correctly', () => {
      const openAISchema = {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            recipeName: { type: 'string' },
            ingredients: {
              type: 'array',
              items: { type: 'string' },
            },
          },
          propertyOrdering: ['recipeName', 'ingredients'],
        },
      };

      const result = convertOpenAISchemaToGoogleSchema(openAISchema);

      expect(result).toEqual({
        type: SchemaType.ARRAY,
        items: {
          type: SchemaType.OBJECT,
          properties: {
            recipeName: { type: SchemaType.STRING },
            ingredients: {
              type: SchemaType.ARRAY,
              items: { type: SchemaType.STRING },
            },
          },
          propertyOrdering: ['recipeName', 'ingredients'],
        },
      });
    });

    it('should handle nested objects', () => {
      const openAISchema = {
        type: 'object',
        properties: {
          user: {
            type: 'object',
            properties: {
              profile: {
                type: 'object',
                properties: {
                  preferences: {
                    type: 'array',
                    items: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      };

      const result = convertOpenAISchemaToGoogleSchema(openAISchema);

      expect(result).toEqual({
        type: SchemaType.OBJECT,
        properties: {
          user: {
            type: SchemaType.OBJECT,
            properties: {
              profile: {
                type: SchemaType.OBJECT,
                properties: {
                  preferences: {
                    type: SchemaType.ARRAY,
                    items: { type: SchemaType.STRING },
                  },
                },
              },
            },
          },
        },
      });
    });

    it('should preserve additional properties like description, enum, required', () => {
      const openAISchema = {
        type: 'object',
        description: 'A person object',
        properties: {
          status: {
            type: 'string',
            enum: ['active', 'inactive'],
            description: 'The status of the person',
          },
        },
        required: ['status'],
      };

      const result = convertOpenAISchemaToGoogleSchema(openAISchema);

      expect(result).toEqual({
        type: SchemaType.OBJECT,
        description: 'A person object',
        properties: {
          status: {
            type: SchemaType.STRING,
            enum: ['active', 'inactive'],
            description: 'The status of the person',
          },
        },
        required: ['status'],
      });
    });

    it('should handle unknown types by defaulting to STRING', () => {
      const openAISchema = {
        type: 'unknown-type',
      };

      const result = convertOpenAISchemaToGoogleSchema(openAISchema);

      expect(result).toEqual({
        type: SchemaType.STRING,
      });
    });
  });

  describe('createGoogleGenerateObject', () => {
    it('should return parsed JSON object on successful API call', async () => {
      const mockClient = {
        models: {
          generateContent: vi.fn().mockResolvedValue({
            text: '{"name": "John", "age": 30}',
          }),
        },
      };

      const contents = [{ role: 'user', parts: [{ text: 'Generate a person object' }] }];

      const payload = {
        contents,
        schema: {
          type: 'object',
          properties: { name: { type: 'string' }, age: { type: 'number' } },
        },
        model: 'gemini-2.5-flash',
      };

      const result = await createGoogleGenerateObject(mockClient as any, payload);

      expect(mockClient.models.generateContent).toHaveBeenCalledWith({
        config: expect.objectContaining({
          responseMimeType: 'application/json',
          responseSchema: expect.objectContaining({
            type: SchemaType.OBJECT,
            properties: expect.objectContaining({
              name: { type: SchemaType.STRING },
              age: { type: SchemaType.NUMBER },
            }),
          }),
          safetySettings: expect.any(Array),
        }),
        contents,
        model: 'gemini-2.5-flash',
      });

      expect(result).toEqual({ name: 'John', age: 30 });
    });

    it('should handle options correctly', async () => {
      const mockClient = {
        models: {
          generateContent: vi.fn().mockResolvedValue({
            text: '{"status": "success"}',
          }),
        },
      };

      const contents = [{ role: 'user', parts: [{ text: 'Generate status' }] }];

      const payload = {
        contents,
        schema: { type: 'object', properties: { status: { type: 'string' } } },
        model: 'gemini-2.5-flash',
      };

      const options = {
        signal: new AbortController().signal,
      };

      const result = await createGoogleGenerateObject(mockClient as any, payload, options);

      expect(mockClient.models.generateContent).toHaveBeenCalledWith({
        config: expect.objectContaining({
          abortSignal: options.signal,
          responseMimeType: 'application/json',
          responseSchema: expect.objectContaining({
            type: SchemaType.OBJECT,
            properties: expect.objectContaining({
              status: { type: SchemaType.STRING },
            }),
          }),
        }),
        contents,
        model: 'gemini-2.5-flash',
      });

      expect(result).toEqual({ status: 'success' });
    });

    it('should return undefined when JSON parsing fails', async () => {
      const mockClient = {
        models: {
          generateContent: vi.fn().mockResolvedValue({
            text: 'invalid json string',
          }),
        },
      };

      const contents: any[] = [];
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const payload = {
        contents,
        schema: { type: 'object' },
        model: 'gemini-2.5-flash',
      };

      const result = await createGoogleGenerateObject(mockClient as any, payload);

      expect(consoleSpy).toHaveBeenCalledWith('parse json error:', 'invalid json string');
      expect(result).toBeUndefined();

      consoleSpy.mockRestore();
    });

    it('should handle complex nested schemas', async () => {
      const mockClient = {
        models: {
          generateContent: vi.fn().mockResolvedValue({
            text: '{"user": {"name": "Alice", "profile": {"age": 25, "preferences": ["music", "sports"]}}, "metadata": {"created": "2024-01-01"}}',
          }),
        },
      };

      const contents: any[] = [];

      const payload = {
        contents,
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
        model: 'gemini-2.5-flash',
      };

      const result = await createGoogleGenerateObject(mockClient as any, payload);

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
        models: {
          generateContent: vi.fn().mockRejectedValue(apiError),
        },
      };

      const contents: any[] = [];

      const payload = {
        contents,
        schema: { type: 'object' },
        model: 'gemini-2.5-flash',
      };

      await expect(createGoogleGenerateObject(mockClient as any, payload)).rejects.toThrow();
    });

    it('should handle abort signals correctly', async () => {
      const apiError = new Error('Request was cancelled');
      apiError.name = 'AbortError';

      const mockClient = {
        models: {
          generateContent: vi.fn().mockRejectedValue(apiError),
        },
      };

      const contents: any[] = [];

      const payload = {
        contents,
        schema: { type: 'object' },
        model: 'gemini-2.5-flash',
      };

      const options = {
        signal: new AbortController().signal,
      };

      await expect(
        createGoogleGenerateObject(mockClient as any, payload, options),
      ).rejects.toThrow();
    });
  });
});
