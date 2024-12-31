import { expect } from 'vitest';

import { AIChatModelCard } from '@/types/aiModel';

import { mergeArrayById } from './merge';

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
});
