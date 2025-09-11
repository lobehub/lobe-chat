import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import {
  MessageToolCallSchema,
  type MessageToolCall,
  type MessageToolCallChunk,
  type ToolFunction,
} from './toolsCalling';

describe('ToolFunction', () => {
  it('should define ToolFunction interface correctly', () => {
    const toolFunction: ToolFunction = {
      arguments: '{"param1": "value1"}',
      name: 'testFunction',
    };

    expect(toolFunction.arguments).toBe('{"param1": "value1"}');
    expect(toolFunction.name).toBe('testFunction');
  });
});

describe('MessageToolCall', () => {
  it('should define MessageToolCall interface correctly', () => {
    const messageToolCall: MessageToolCall = {
      function: {
        arguments: '{"param1": "value1"}',
        name: 'testFunction',
      },
      id: 'call_123',
      type: 'function',
    };

    expect(messageToolCall.function.arguments).toBe('{"param1": "value1"}');
    expect(messageToolCall.function.name).toBe('testFunction');
    expect(messageToolCall.id).toBe('call_123');
    expect(messageToolCall.type).toBe('function');
  });

  it('should allow custom type values', () => {
    const messageToolCall: MessageToolCall = {
      function: {
        arguments: '{}',
        name: 'customFunction',
      },
      id: 'call_456',
      type: 'custom_type',
    };

    expect(messageToolCall.type).toBe('custom_type');
  });
});

describe('MessageToolCallSchema', () => {
  it('should validate valid MessageToolCall', () => {
    const validToolCall = {
      function: {
        arguments: '{"param1": "value1"}',
        name: 'testFunction',
      },
      id: 'call_123',
      type: 'function',
    };

    const result = MessageToolCallSchema.safeParse(validToolCall);
    expect(result.success).toBe(true);
    
    if (result.success) {
      expect(result.data).toEqual(validToolCall);
    }
  });

  it('should reject invalid MessageToolCall with missing fields', () => {
    const invalidToolCall = {
      function: {
        arguments: '{"param1": "value1"}',
        // missing name
      },
      id: 'call_123',
      type: 'function',
    };

    const result = MessageToolCallSchema.safeParse(invalidToolCall);
    expect(result.success).toBe(false);
  });

  it('should reject invalid MessageToolCall with wrong types', () => {
    const invalidToolCall = {
      function: {
        arguments: 123, // should be string
        name: 'testFunction',
      },
      id: 'call_123',
      type: 'function',
    };

    const result = MessageToolCallSchema.safeParse(invalidToolCall);
    expect(result.success).toBe(false);
  });

  it('should be a valid Zod schema', () => {
    expect(MessageToolCallSchema).toBeInstanceOf(z.ZodObject);
  });
});

describe('MessageToolCallChunk', () => {
  it('should define MessageToolCallChunk type correctly', () => {
    const chunk: MessageToolCallChunk = {
      index: 0,
      function: {
        name: 'testFunction',
      },
      id: 'call_123',
    };

    expect(chunk.index).toBe(0);
    expect(chunk.function?.name).toBe('testFunction');
    expect(chunk.id).toBe('call_123');
  });

  it('should allow partial tool call data', () => {
    const partialChunk: MessageToolCallChunk = {
      index: 1,
      function: {
        arguments: '{"param": "value"}',
      },
    };

    expect(partialChunk.index).toBe(1);
    expect(partialChunk.function?.arguments).toBe('{"param": "value"}');
    expect(partialChunk.id).toBeUndefined();
    expect(partialChunk.type).toBeUndefined();
  });

  it('should allow empty function object', () => {
    const emptyChunk: MessageToolCallChunk = {
      index: 2,
      function: {},
    };

    expect(emptyChunk.index).toBe(2);
    expect(emptyChunk.function).toEqual({});
  });
});
