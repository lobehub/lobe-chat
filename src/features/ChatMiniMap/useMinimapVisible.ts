import { conversationSelectors, useConversationStore } from '@/features/Conversation';

import { MINIMAP_GUTTER_WIDTH, shouldShowMinimap } from './utils';

/**
 * Whether the minimap rail is shown for the current conversation. Mirrors the
 * indicator source in `useMinimapData` (one indicator per user message).
 */
export const useMinimapVisible = (): boolean => {
  const userMessageCount = useConversationStore(
    (s) =>
      conversationSelectors.displayMessages(s).filter((message) => message.role === 'user').length,
  );

  return shouldShowMinimap(userMessageCount);
};

/**
 * Inline-end space the message list must reserve so the rail never covers
 * wide content. `undefined` while the rail is hidden or not mounted.
 */
export const useMinimapGutterWidth = (enabled = true): number | undefined => {
  const visible = useMinimapVisible();

  return enabled && visible ? MINIMAP_GUTTER_WIDTH : undefined;
};
