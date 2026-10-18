import { type ConversationContext } from '@lobechat/types';

import { getChatStoreState } from '@/store/chat/store';

/**
 * Evict the persisted transcripts of conversations matching `predicate` (every
 * one when omitted), for stores outside the chat store that delete them.
 *
 * Transcripts persist in the message replica's IndexedDB rows, which never
 * expire, so once a topic / agent is deleted its transcript would orphan there
 * (and hydrate again) unless it is dropped explicitly. Nothing is refetched —
 * the conversation is gone. See `evictConversationMessages`.
 *
 * @example
 * // every topic under a deleted agent
 * void evictMessageCache((ctx) => ctx.agentId === agentId);
 */
export const evictMessageCache = (
  predicate?: (ctx: ConversationContext) => boolean,
): Promise<void> => getChatStoreState().evictConversationMessages(predicate);
