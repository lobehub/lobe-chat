import { describe, expect, it } from 'vitest';

import { AssistantContentBlock } from '@/types/message';

import { getBlockPosition } from './utils';

describe('getBlockPosition', () => {
  const createBlock = (hasTools: boolean): AssistantContentBlock => ({
    content: 'test',
    id: `block-${Math.random()}`,
    tools: hasTools ? [{ apiName: 'test', arguments: '{}', id: '1', identifier: 'test', type: 'builtin' }] : undefined,
  });

  it('should return undefined when block has no tools', () => {
    const children = [createBlock(false), createBlock(true)];
    expect(getBlockPosition(children, 0)).toBeUndefined();
  });

  it('should return "standalone" when block has tools but neighbors do not', () => {
    const children = [createBlock(false), createBlock(true), createBlock(false)];
    expect(getBlockPosition(children, 1)).toBe('standalone');
  });

  it('should return "start" when block has tools, next has tools, but prev does not', () => {
    const children = [createBlock(false), createBlock(true), createBlock(true), createBlock(false)];
    expect(getBlockPosition(children, 1)).toBe('start');
  });

  it('should return "middle" when block has tools and both neighbors have tools', () => {
    const children = [
      createBlock(false),
      createBlock(true),
      createBlock(true),
      createBlock(true),
      createBlock(false),
    ];
    expect(getBlockPosition(children, 2)).toBe('middle');
  });

  it('should return "end" when block has tools, prev has tools, but next does not', () => {
    const children = [createBlock(false), createBlock(true), createBlock(true), createBlock(false)];
    expect(getBlockPosition(children, 2)).toBe('end');
  });

  it('should handle first block with tools followed by tools', () => {
    const children = [createBlock(true), createBlock(true), createBlock(false)];
    expect(getBlockPosition(children, 0)).toBe('start');
  });

  it('should handle last block with tools preceded by tools', () => {
    const children = [createBlock(false), createBlock(true), createBlock(true)];
    expect(getBlockPosition(children, 2)).toBe('end');
  });

  it('should handle single block with tools', () => {
    const children = [createBlock(true)];
    expect(getBlockPosition(children, 0)).toBe('standalone');
  });

  it('should handle all blocks with tools', () => {
    const children = [createBlock(true), createBlock(true), createBlock(true), createBlock(true)];
    expect(getBlockPosition(children, 0)).toBe('start');
    expect(getBlockPosition(children, 1)).toBe('middle');
    expect(getBlockPosition(children, 2)).toBe('middle');
    expect(getBlockPosition(children, 3)).toBe('end');
  });

  it('should handle empty tools array as no tools', () => {
    const blockWithEmptyTools: AssistantContentBlock = {
      content: 'test',
      id: 'empty-tools',
      tools: [],
    };
    const children = [blockWithEmptyTools, createBlock(true)];
    expect(getBlockPosition(children, 0)).toBeUndefined();
  });

  it('should handle consecutive standalone blocks', () => {
    const children = [
      createBlock(false),
      createBlock(true),
      createBlock(false),
      createBlock(true),
      createBlock(false),
    ];
    expect(getBlockPosition(children, 1)).toBe('standalone');
    expect(getBlockPosition(children, 3)).toBe('standalone');
  });
});
