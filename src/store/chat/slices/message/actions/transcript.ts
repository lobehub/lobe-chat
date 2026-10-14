import { type ConversationContext } from '@lobechat/types';
import debug from 'debug';
import { useEffect, useMemo, useRef } from 'react';
import { type StoreApi, useStore } from 'zustand';

import {
  getMessageListCacheIdentity,
  getMessageListFetchPolicy,
  getMessageListWindowOlderCursor,
  supportsRoundCursor,
} from '@/services/message/cache';
import { conversationMessagesResource } from '@/services/message/replica';
import { operationSelectors } from '@/store/chat/slices/operation/selectors';
import { topicSelectors } from '@/store/chat/slices/topic/selectors';
import { type ChatStore } from '@/store/chat/store';
import {
  hasPendingInterventions,
  INTERVENTION_REFRESH_INTERVAL,
} from '@/store/chat/utils/interventionSync';
import { messageMapKey } from '@/store/chat/utils/messageMapKey';
import { type StoreSetter } from '@/store/types';

import { getMessageTranscript } from '../transcript';

const log = debug('lobe-store:message-transcript');

/** Fetch flags of a transcript sync. The rows live in `dbMessagesMap`. */
export interface MessageSyncResult {
  error: unknown;
  /** A first fetch is in flight and nothing is on screen yet. */
  isLoading: boolean;
  isValidating: boolean;
  /** Re-run the head sync. */
  mutate: () => Promise<unknown>;
}

export interface MessageSyncOptions {
  refreshInterval?: number;
  /**
   * Override SWR's default focus revalidate. Pass `false` while a streaming
   * flow owns the in-memory rows so a focus refetch doesn't clobber them with
   * a stale DB snapshot.
   */
  revalidateOnFocus?: boolean;
  /** No read at all (e.g. while another flow owns the data). */
  skipFetch?: boolean;
  /** Re-read the head after a parked intervention run completes (main topics only). */
  syncInterventions?: boolean;
}

type Setter = StoreSetter<ChatStore>;

/**
 * Reads of the transcript replica: the mounted sync, paging older history,
 * pre-paint hydration and run-end persistence.
 */
export class MessageTranscriptActionImpl {
  readonly #api: StoreApi<ChatStore>;
  readonly #get: () => ChatStore;
  readonly #set: Setter;

  constructor(set: Setter, get: () => ChatStore, api?: unknown) {
    this.#api = api as StoreApi<ChatStore>;
    this.#set = set;
    this.#get = get;
  }

  get #transcript() {
    return getMessageTranscript(this.#set, this.#get);
  }

  /**
   * Persist a conversation's settled transcript. Runs when an agent run ends,
   * including for a conversation no view shows any more.
   */
  internal_settleTranscript = (context: ConversationContext): void => {
    this.#transcript.settle(context);
  };

  /**
   * Load one round-aligned page of history older than the server's
   * newest-first window and prepend it to the transcript. No-ops while a page
   * is in flight, once the beginning is reached, or before the conversation
   * has server-backed rows. Never rejects: resolves the failure instead.
   * `started` tells whether a page was requested; `onStart` runs right before.
   */
  loadEarlierMessages = async (
    context: ConversationContext,
    options?: { onStart?: () => void },
  ): Promise<{ error?: unknown; started: boolean }> => {
    const skipped = { started: false };
    if (!context.agentId || !context.topicId) return skipped;

    const { slice } = this.#transcript;
    const key = this.#transcript.keyOf(context);
    const read = () => this.#transcript.read(key);
    const view = read();
    if (!view || view.isLoadingMore) return skipped;

    // A transcript not yet confirmed by a sync (seeded by a send, or painted
    // from storage) pages from the window cursor this session already fetched.
    // A cursor rebuilt from a row's millisecond `createdAt` would skip older
    // rows sharing that millisecond, so a round-cursor read waits for it.
    if (
      this.#get().messageReplica.entries[key]?.source !== 'server' &&
      view.nextCursor === undefined
    ) {
      const windowCursor = getMessageListWindowOlderCursor(context);
      if (windowCursor === undefined && supportsRoundCursor(context)) return skipped;
      if (windowCursor !== undefined)
        slice.update(
          key,
          (data) => data && { ...data, hasMore: windowCursor !== null, nextCursor: windowCursor },
          { persist: false },
        );
    }
    if (!read()?.hasMore) return skipped;

    options?.onStart?.();
    await slice.loadMore(key, context);
    const error = read()?.loadMoreError;
    if (error) log('[loadEarlierMessages] failed | key=%s | %O', messageMapKey(context), error);
    return { error: error ?? undefined, started: true };
  };

  /**
   * Seed a conversation's persisted transcript before its route commits, so a
   * topic opened before paints from local data instead of a skeleton. Rows
   * already in memory (this session's, or streamed) are newer and stay.
   */
  preHydrateMessages = async (context: ConversationContext): Promise<boolean> => {
    const { slice } = this.#transcript;
    const scope = conversationMessagesResource.scope.get();
    // The slot may still hold the previous identity's rows (a session that
    // ended before the identity round-trip landed); drop them before seeding.
    slice.ensureScope(scope);
    return slice.hydrate(context, scope);
  };

  /**
   * Keep a conversation's transcript in sync while a view shows it.
   *
   * Main topics also watch parked intervention runs: an answer given on
   * another device settles the pending card, and the run's `runningOperation`
   * marker is published for the gateway reconnect.
   */
  useFetchMessages = (
    context: ConversationContext,
    options?: MessageSyncOptions,
  ): MessageSyncResult => {
    const { slice, headResolutions, pendingInterventions } = this.#transcript;
    const { skipFetch, revalidateOnFocus, refreshInterval = 0 } = options ?? {};
    // No read for a conversation without a server topic yet (new conversation
    // state): there is no server data, only local optimistic rows, and an
    // empty answer would overwrite them.
    const shouldFetch = !skipFetch && !!context.agentId && !!context.topicId;
    const syncKey = getMessageListCacheIdentity(context);
    // Shared views use share-authorized services; thread runs do not own the
    // topic's main runningOperation marker. Keep their existing refresh path.
    const syncContinuation =
      !!options?.syncInterventions &&
      !context.agentShareId &&
      !context.topicShareId &&
      !context.threadId;
    // Stable identity: the poll timer restarts whenever the interval option
    // changes, so a fresh function per render would postpone every tick.
    const pollInterval = useMemo(
      () =>
        syncContinuation
          ? () =>
              pendingInterventions.has(syncKey) ? INTERVENTION_REFRESH_INTERVAL : refreshInterval
          : refreshInterval,
      [syncContinuation, syncKey, refreshInterval],
    );

    const result = slice.useSync(
      { ...context, syncInterventions: syncContinuation },
      {
        ...getMessageListFetchPolicy(context),
        enabled: shouldFetch,
        // Pending cards must observe answers from another device before the
        // normal message cache's 30-second verification window expires.
        ...((refreshInterval > 0 || pendingInterventions.has(syncKey)) && {
          dedupingInterval: 1000,
        }),
        onSuccess: (fetched) => {
          const resolution = Array.isArray(fetched) ? headResolutions.get(fetched) : undefined;
          if (!resolution || !context.topicId) return;
          headResolutions.delete(fetched as never);
          const { completed, isStreaming, mergedMessages, ownsTopic, snapshot } = resolution;

          // Do not replace a topic marker claimed by a local send or newer push.
          if (!snapshot || hasPendingInterventions(mergedMessages) || !ownsTopic) return;
          if (completed && !isStreaming) pendingInterventions.delete(syncKey);
          const chat = this.#get();
          const currentTopic = topicSelectors.getTopicById(context.topicId)(chat);
          const runningOperation = snapshot.topic?.metadata?.runningOperation;
          if (
            !runningOperation ||
            currentTopic?.metadata?.runningOperation?.operationId === runningOperation.operationId
          )
            return;
          // Publish the marker for useGatewayReconnect; it owns connection
          // deduplication and retry. Do not open a second socket here.
          if (currentTopic) {
            chat.internal_dispatchTopic({
              agentId: context.agentId,
              containerKey: topicSelectors.getTopicContainerKeyById(context.topicId)(chat),
              groupId: context.groupId,
              id: context.topicId,
              type: 'updateTopic',
              value: { metadata: { ...currentTopic.metadata, runningOperation } },
            });
          } else if (snapshot.topic) {
            this.#set({
              topicDetailMap: { ...chat.topicDetailMap, [context.topicId]: snapshot.topic },
            });
          }
        },
        refreshInterval: pollInterval,
        refreshWhenHidden: false,
        refreshWhenOffline: false,
        ...(revalidateOnFocus !== undefined && { revalidateOnFocus }),
      },
    );

    // Streamed chunks stay in memory; the transcript is persisted once the
    // run settles, so a reload restores the finished reply.
    const isStreaming = useStore(
      this.#api,
      operationSelectors.isAgentRuntimeRunningByContext(context),
    );
    const bucket = messageMapKey(context);
    const wasStreamingRef = useRef({ bucket, running: isStreaming });
    useEffect(() => {
      if (
        wasStreamingRef.current.bucket === bucket &&
        wasStreamingRef.current.running &&
        !isStreaming
      )
        this.#transcript.settle(context);
      wasStreamingRef.current = { bucket, running: isStreaming };
    }, [isStreaming, bucket]);

    const hasRows = useStore(this.#api, (s) => !!s.dbMessagesMap[bucket]);

    return {
      error: result.error,
      isLoading: result.isValidating && !hasRows,
      isValidating: result.isValidating,
      mutate: result.revalidate,
    };
  };
}

export type MessageTranscriptAction = Pick<
  MessageTranscriptActionImpl,
  keyof MessageTranscriptActionImpl
>;
