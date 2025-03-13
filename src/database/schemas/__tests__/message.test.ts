import { createSelectSchema } from 'drizzle-zod';
import { describe, expect, it } from 'vitest';

import { messagePlugins } from '../message';

describe('updateMessagePluginSchema', () => {
  it('should create a valid schema from message plugins table', () => {
    const schema = createSelectSchema(messagePlugins);

    expect(schema.shape).toEqual({
      id: expect.any(Object),
      toolCallId: expect.any(Object),
      type: expect.any(Object),
      apiName: expect.any(Object),
      arguments: expect.any(Object),
      identifier: expect.any(Object),
      state: expect.any(Object),
      error: expect.any(Object),
    });
  });

  it('should validate valid message plugin data', () => {
    const schema = createSelectSchema(messagePlugins);

    const validData = {
      id: 'msg_123',
      toolCallId: 'call_123',
      type: 'default',
      apiName: 'test-api',
      arguments: '{"foo":"bar"}',
      identifier: 'test-plugin',
      state: {},
      error: null,
    };

    const result = schema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should reject invalid message plugin data', () => {
    const schema = createSelectSchema(messagePlugins);

    const invalidData = {
      id: 123, // Should be string
      type: 'invalid-type', // Invalid enum value
    };

    const result = schema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});
