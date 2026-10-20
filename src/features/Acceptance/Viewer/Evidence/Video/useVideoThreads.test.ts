import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { EvidenceOverlay } from '../overlay';
import { useVideoThreads, videoThreadsOf } from './useVideoThreads';

const overlay = (threadId: string, start?: number, replies: string[] = []): EvidenceOverlay => ({
  commentIds: [threadId, ...replies],
  rect: { height: 0.2, width: 0.2, x: 0.1, y: 0.1 },
  threadId,
  time: start === undefined ? undefined : { start },
});

const overlays = [overlay('late', 6), overlay('image'), overlay('early', 2, ['early-reply'])];

describe('video threads', () => {
  it('lists only timed threads, in playing order', () => {
    expect(videoThreadsOf(overlays).map((item) => item.threadId)).toEqual(['early', 'late']);
  });

  it('keeps one thread unfolded and folds it on a second press', () => {
    const { result } = renderHook(() => useVideoThreads(overlays, undefined, vi.fn()));
    expect(result.current.openId).toBeUndefined();

    act(() => {
      expect(result.current.toggle('early')).toBe(true);
    });
    expect(result.current.openId).toBe('early');
    act(() => result.current.open('late'));
    expect(result.current.openId).toBe('late');
    act(() => {
      expect(result.current.toggle('late')).toBe(false);
    });
    expect(result.current.openId).toBeUndefined();
  });

  it('opens the thread a reply link addresses and shows its frame once', () => {
    const onAnchor = vi.fn();
    const { result, rerender } = renderHook(() =>
      useVideoThreads(overlays, 'early-reply', onAnchor),
    );
    expect(result.current.openId).toBe('early');
    expect(onAnchor).toHaveBeenCalledWith(expect.objectContaining({ threadId: 'early' }));

    act(() => result.current.toggle('early'));
    rerender();
    expect(result.current.openId).toBeUndefined();
    expect(onAnchor).toHaveBeenCalledTimes(1);
  });
});
