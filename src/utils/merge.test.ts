import { describe, expect, it } from 'vitest';

import { merge, mergeArrayById } from './merge';

describe('merge', () => {
  it('should merge objects and replace arrays', () => {
    const target = {
      a: 1,
      b: [1, 2, 3],
      c: { d: 4 },
    };
    const source = {
      b: [4, 5],
      c: { e: 5 },
    };

    const result = merge(target, source);

    expect(result).toEqual({
      a: 1,
      b: [4, 5],
      c: { d: 4, e: 5 },
    });
  });
});

describe('mergeArrayById', () => {
  it('should merge data', () => {
    const data = mergeArrayById(
      [
        {
          contextWindowTokens: 128_000,
          description:
            'o1-mini是一款针对编程、数学和科学应用场景而设计的快速、经济高效的推理模型。该模型具有128K上下文和2023年10月的知识截止日期。',
          displayName: 'OpenAI o1-mini',
          enabled: true,
          id: 'o1-mini',
          maxOutput: 65_536,
          pricing: {
            input: 3,
            output: 12,
          },
          releasedAt: '2024-09-12',
          type: 'chat',
        },
      ],
      [{ id: 'o1-mini', displayName: 'OpenAI o1-mini ABC', type: 'chat' }],
    );

    expect(data).toEqual([
      {
        contextWindowTokens: 128_000,
        description:
          'o1-mini是一款针对编程、数学和科学应用场景而设计的快速、经济高效的推理模型。该模型具有128K上下文和2023年10月的知识截止日期。',
        displayName: 'OpenAI o1-mini ABC',
        enabled: true,
        id: 'o1-mini',
        maxOutput: 65_536,
        pricing: {
          input: 3,
          output: 12,
        },
        releasedAt: '2024-09-12',
        type: 'chat',
      },
    ]);
  });

  it('should merge data with objects', () => {
    const data = mergeArrayById(
      [
        {
          contextWindowTokens: 128_000,
          description:
            'o1-mini是一款针对编程、数学和科学应用场景而设计的快速、经济高效的推理模型。该模型具有128K上下文和2023年10月的知识截止日期。',
          displayName: 'OpenAI o1-mini',
          enabled: true,
          id: 'o3-mini',
          abilities: {
            functionCall: true,
          },
          maxOutput: 65_536,
          pricing: {
            input: 3,
            output: 12,
          },
          releasedAt: '2024-09-12',
          type: 'chat',
        },
      ],
      [
        {
          id: 'o3-mini',
          contextWindowTokens: null,
          displayName: 'OpenAI o1-mini ABC',
          type: 'chat',
          abilities: {},
          enabled: false,
        },
      ],
    );

    expect(data).toEqual([
      {
        contextWindowTokens: 128_000,
        description:
          'o1-mini是一款针对编程、数学和科学应用场景而设计的快速、经济高效的推理模型。该模型具有128K上下文和2023年10月的知识截止日期。',
        displayName: 'OpenAI o1-mini ABC',
        enabled: false,
        id: 'o3-mini',
        maxOutput: 65_536,
        pricing: {
          input: 3,
          output: 12,
        },
        abilities: {
          functionCall: true,
        },
        releasedAt: '2024-09-12',
        type: 'chat',
      },
    ]);
  });

  it('should handle items only in default configuration', () => {
    const data = mergeArrayById(
      [
        { id: '1', value: 'default1' },
        { id: '2', value: 'default2' },
      ],
      [{ id: '1', value: 'user1' }],
    );

    expect(data).toEqual([
      { id: '1', value: 'user1' },
      { id: '2', value: 'default2' },
    ]);
  });
});
