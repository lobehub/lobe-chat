import type { AcceptanceCommentTime } from '@lobechat/types';
import { useEffect, useRef, useState } from 'react';

import type { EvidenceOverlay } from '../overlay';

export type VideoThread = EvidenceOverlay & {
  threadId: string;
  time: AcceptanceCommentTime;
};

/** The posted threads on one video, in the order it plays them. */
export const videoThreadsOf = (overlays: EvidenceOverlay[]) =>
  overlays
    .filter((item): item is VideoThread => Boolean(item.time && item.threadId))
    .toSorted((a, b) => a.time.start - b.time.start);

/** The thread a comment link points at — its root or any reply in it. */
export const threadAddressedBy = (threads: VideoThread[], commentId?: string) =>
  commentId
    ? threads.find((item) => item.threadId === commentId || item.commentIds?.includes(commentId))
    : undefined;

/**
 * Which posted thread under a video is unfolded. One at a time: opening a
 * thread is reading it on its frame, and the frame can only show one moment.
 * A comment link opens its thread once and asks the caller to show its frame.
 */
export const useVideoThreads = (
  overlays: EvidenceOverlay[],
  anchored: string | undefined,
  onAnchor: (thread: VideoThread) => void,
) => {
  const threads = videoThreadsOf(overlays);
  const [openId, setOpenId] = useState(() => threadAddressedBy(threads, anchored)?.threadId);
  const handled = useRef<string | undefined>(undefined);
  useEffect(() => {
    const thread = threadAddressedBy(threads, anchored);
    if (!thread || handled.current === anchored) return;
    handled.current = anchored;
    setOpenId(thread.threadId);
    onAnchor(thread);
    // The list arrives after the fragment is read; re-check when it does.
  }, [anchored, overlays]);

  return {
    open: (id: string) => setOpenId(id),
    openId,
    threads,
    /** A second press on the open row folds it. */
    toggle: (id: string) => {
      const opening = openId !== id;
      setOpenId(opening ? id : undefined);
      return opening;
    },
  };
};
