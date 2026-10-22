import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useMinimapGutterWidth, useMinimapVisible } from './useMinimapVisible';
import { MINIMAP_GUTTER_WIDTH } from './utils';

let messages: { id: string; role: string }[] = [];

vi.mock('@/features/Conversation', () => ({
  conversationSelectors: {
    displayMessages: (s: { displayMessages: typeof messages }) => s.displayMessages,
  },
  useConversationStore: (selector: (s: { displayMessages: typeof messages }) => unknown) =>
    selector({ displayMessages: messages }),
}));

const createTurns = (count: number) =>
  Array.from({ length: count }).flatMap((_, i) => [
    { id: `u${i}`, role: 'user' },
    { id: `a${i}`, role: 'assistant' },
  ]);

describe('useMinimapVisible', () => {
  beforeEach(() => {
    messages = [];
  });

  it('counts only user messages against the threshold', () => {
    messages = createTurns(3);
    expect(renderHook(() => useMinimapVisible()).result.current).toBe(false);

    messages = createTurns(4);
    expect(renderHook(() => useMinimapVisible()).result.current).toBe(true);
  });
});

describe('useMinimapGutterWidth', () => {
  beforeEach(() => {
    messages = [];
  });

  it('reserves the rail lane while the minimap is shown', () => {
    messages = createTurns(4);

    expect(renderHook(() => useMinimapGutterWidth()).result.current).toBe(MINIMAP_GUTTER_WIDTH);
  });

  it('reserves no space while the minimap is hidden', () => {
    messages = createTurns(3);

    expect(renderHook(() => useMinimapGutterWidth()).result.current).toBeUndefined();
  });

  it('reserves no space when the minimap is not mounted', () => {
    messages = createTurns(10);

    expect(renderHook(() => useMinimapGutterWidth(false)).result.current).toBeUndefined();
  });
});
