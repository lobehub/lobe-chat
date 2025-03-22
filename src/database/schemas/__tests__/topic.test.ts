import { describe, expect, it } from 'vitest';

import { insertThreadSchema } from '../topic';

describe('insertThreadSchema', () => {
  it('should validate valid thread data', () => {
    const validThread = {
      id: 'thd_123',
      title: 'Test Thread',
      type: 'standalone' as const,
      status: 'active' as const,
      topicId: 'tpc_123',
      sourceMessageId: 'msg_123',
      userId: 'user_123',
      clientId: 'client_123',
    };

    const result = insertThreadSchema.safeParse(validThread);
    expect(result.success).toBe(true);
  });

  it('should reject invalid thread data', () => {
    const invalidThread = {
      // Missing required fields
      id: 'thd_123',
      title: 'Test Thread',
    };

    const result = insertThreadSchema.safeParse(invalidThread);
    expect(result.success).toBe(false);
  });

  it('should validate thread with optional fields', () => {
    const threadWithOptionals = {
      id: 'thd_123',
      title: 'Test Thread',
      type: 'continuation' as const,
      status: 'deprecated' as const,
      topicId: 'tpc_123',
      sourceMessageId: 'msg_123',
      parentThreadId: 'thd_456',
      userId: 'user_123',
      clientId: 'client_123',
      lastActiveAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      accessedAt: new Date(),
    };

    const result = insertThreadSchema.safeParse(threadWithOptionals);
    expect(result.success).toBe(true);
  });

  it('should reject invalid enum values', () => {
    const invalidEnums = {
      id: 'thd_123',
      title: 'Test Thread',
      type: 'invalid_type', // Invalid type
      status: 'invalid_status', // Invalid status
      topicId: 'tpc_123',
      sourceMessageId: 'msg_123',
      userId: 'user_123',
    };

    const result = insertThreadSchema.safeParse(invalidEnums);
    expect(result.success).toBe(false);
  });
});
