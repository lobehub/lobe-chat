import { describe, expect, it } from 'vitest';

import { insertKnowledgeBasesSchema } from '../file';

describe('insertKnowledgeBasesSchema', () => {
  it('should validate valid knowledge base data', () => {
    const validData = {
      name: 'Test KB',
      userId: 'user123',
    };

    const result = insertKnowledgeBasesSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should fail validation for missing required fields', () => {
    const invalidData = {
      description: 'Test description',
    };

    const result = insertKnowledgeBasesSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should allow optional fields', () => {
    const dataWithOptionals = {
      name: 'Test KB',
      userId: 'user123',
      description: 'Test description',
      avatar: 'avatar.png',
      type: 'test',
      clientId: 'client123',
      isPublic: true,
      settings: { key: 'value' },
    };

    const result = insertKnowledgeBasesSchema.safeParse(dataWithOptionals);
    expect(result.success).toBe(true);
  });

  it('should validate field types', () => {
    const invalidTypes = {
      name: 123,
      userId: true,
      isPublic: 'yes',
    };

    const result = insertKnowledgeBasesSchema.safeParse(invalidTypes);
    expect(result.success).toBe(false);
  });
});
