import { describe, expect, it } from 'vitest';
import { ZodError } from 'zod';

import { parseToolCalls } from '../parseToolCalls';

describe('parseToolCalls', () => {
  it('should create add new item', () => {
    const chunk = [
      { index: 0, id: '1', type: 'function', function: { name: 'func', arguments: '' } },
    ];

    const result = parseToolCalls([], chunk);
    expect(result).toEqual([
      { id: '1', type: 'function', function: { name: 'func', arguments: '' } },
    ]);
  });

  it('should update arguments if there is a toolCall', () => {
    const origin = [{ id: '1', type: 'function', function: { name: 'func', arguments: '' } }];

    const chunk1 = [{ index: 0, function: { arguments: '{"lo' } }];

    const result1 = parseToolCalls(origin, chunk1);
    expect(result1).toEqual([
      { id: '1', type: 'function', function: { name: 'func', arguments: '{"lo' } },
    ]);

    const chunk2 = [{ index: 0, function: { arguments: 'cation\\": \\"Hangzhou\\"}' } }];
    const result2 = parseToolCalls(result1, chunk2);

    expect(result2).toEqual([
      {
        id: '1',
        type: 'function',
        function: { name: 'func', arguments: '{"location\\": \\"Hangzhou\\"}' },
      },
    ]);
  });

  it('should add a new tool call if the index is different', () => {
    const origin = [
      {
        id: '1',
        type: 'function',
        function: { name: 'func', arguments: '{"location\\": \\"Hangzhou\\"}' },
      },
    ];

    const chunk = [
      {
        index: 1,
        id: '2',
        type: 'function',
        function: { name: 'func', arguments: '' },
      },
    ];

    const result1 = parseToolCalls(origin, chunk);
    expect(result1).toEqual([
      {
        id: '1',
        type: 'function',
        function: { name: 'func', arguments: '{"location\\": \\"Hangzhou\\"}' },
      },
      { id: '2', type: 'function', function: { name: 'func', arguments: '' } },
    ]);
  });

  it('should update correct arguments if there are multi tool calls', () => {
    const origin = [
      {
        id: '1',
        type: 'function',
        function: { name: 'func', arguments: '{"location\\": \\"Hangzhou\\"}' },
      },
      { id: '2', type: 'function', function: { name: 'func', arguments: '' } },
    ];

    const chunk = [{ index: 1, function: { arguments: '{"location\\": \\"Beijing\\"}' } }];

    const result1 = parseToolCalls(origin, chunk);
    expect(result1).toEqual([
      {
        id: '1',
        type: 'function',
        function: { name: 'func', arguments: '{"location\\": \\"Hangzhou\\"}' },
      },
      {
        id: '2',
        type: 'function',
        function: { name: 'func', arguments: '{"location\\": \\"Beijing\\"}' },
      },
    ]);
  });

  it('should throw error if incomplete tool calls data', () => {
    const origin = [
      {
        id: '1',
        type: 'function',
        function: { name: 'func', arguments: '{"location\\": \\"Hangzhou\\"}' },
      },
    ];

    const chunk = [{ index: 1, id: '2', type: 'function' }];

    try {
      parseToolCalls(origin, chunk as any);
    } catch (e) {
      expect(e).toEqual(
        new ZodError([
          {
            code: 'invalid_type',
            expected: 'object',
            received: 'undefined',
            path: ['function'],
            message: 'Required',
          },
        ]),
      );
    }
  });
});
