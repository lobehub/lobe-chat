import { type ChatTopic, type ConversationContext, type UIChatMessage } from '@lobechat/types';
import debug from 'debug';

import { readConversationMessageListPage } from '@/helpers/conversationMessageRead';
import { createReplicaSlice, readReplicaStoredKeys } from '@/libs/replica';
import { lambdaClient } from '@/libs/trpc/client';
import { messageService } from '@/services/message';
import {
  getMessageListCacheIdentity,
  getMessageListWindowOlderCursor,
  runMessageListQuery,
} from '@/services/message/cache';
import {
  type ConversationMessageFetch,
  type ConversationMessagePage,
  type ConversationMessageParams,
  conversationMessagesKey,
  conversationMessagesResource,
  persistedContextOf,
  toPersistedTranscript,
  transcriptOf,
} from '@/services/message/replica';
import {
  readMessagesForward,
  SHARED_TOPIC_FIRST_PAGE,
  takePrimedForwardMessagePage,
} from '@/services/message/roundCursorPage';
import { topicService } from '@/services/topic';
import { operationSelectors } from '@/store/chat/slices/operation/selectors';
import { topicSelectors } from '@/store/chat/slices/topic/selectors';
import { type ChatStore } from '@/store/chat/store';
import {
  hasPendingInterventions,
  isInterventionRunActive,
  reconcileStreamingInterventions,
} from '@/store/chat/utils/interventionSync';
import { type StoreSetter } from '@/store/types';

import { bucketOfKey, createTranscriptLens } from './lens';
import { type HeadRequestBoundary, mergeFetchedMessagesWithLocalState } from './mergeFetched';

const log = debug('lobe-store:message-transcript');

export interface InterventionSnapshot {
  dbMessages: UIChatMessage[];
  topic: ChatTopic | null;
  topicAtRequest?: ChatTopic;
}

/** What a head response resolved to, handed from `prepareHead` to the sync's `onSuccess`. */
export interface HeadResolution {
  completed: boolean;
  /** The response changed nothing during a stream: kept off the transcript. */
  dropped: boolean;
  isStreaming: boolean;
  mergedMessages: UIChatMessage[];
  ownsTopic: boolean;
  snapshot?: InterventionSnapshot;
}

type TranscriptContext = Partial<ConversationContext> & Pick<ConversationContext, 'agentId'>;

/**
 * The chat store's message replica: one entry per conversation bucket, the
 * only writer of `dbMessagesMap` / `messagesMap`. Every surface showing a
 * conversation reads that bucket; streamed chunks stay in memory and the
 * settled transcript persists, so a reload paints the finished reply.
 */
const createMessageTranscript = (set: StoreSetter<ChatStore>, get: () => ChatStore) => {
  /** Main-topic sync keys waiting for a parked intervention run to settle. */
  const pendingInterventions = new Set<string>();
  const snapshots = new WeakMap<UIChatMessage[], InterventionSnapshot>();
  /** Head responses resolved by `prepareHead`, read back by the sync's `onSuccess`. */
  const headResolutions = new WeakMap<UIChatMessage[], HeadResolution>();
  /** What a head read can be missing, captured when the read is issued. */
  type HeadRequestStart = {
    idsAtRequestStart: Set<string>;
    localWriteSeqAtRequestStart: number;
  };
  /**
   * The rows a head read could be missing, captured when it was issued. A read
   * that is still in flight when a send lands resolves with the pre-send
   * snapshot; rows written in memory after this point must survive it even once
   * the send operation has handed off to the runtime.
   *
   * The first read of a shared request wins: it started earliest, so it is the
   * most conservative boundary for what the response can be missing.
   */
  const headRequestBoundaries = new WeakMap<UIChatMessage[], HeadRequestStart>();
  /**
   * Rows a client mutation created, in write order. These may not have reached
   * the server when a read is issued, so a snapshot that omits one can be stale.
   *
   * Rows applied from a server response (`replaceMessages`) and rows painted
   * from storage hydration are deliberately absent: the server already knows
   * them, so a snapshot that omits one is authoritative (e.g. a remote delete).
   */
  const localWrittenAt = new Map<string, number>();
  let localWriteSeq = 0;
  /**
   * Reads whose physical query has not resolved yet, by the sequence at which
   * they started. Pruning never drops a mark an unfinished read can still need.
   */
  const inFlightReadStarts = new Map<number, number>();
  /**
   * Backstop for sessions that keep writing without another head read. Only
   * rows written since the oldest live boundary can affect a merge; older ones
   * are history no request can still ask about.
   */
  const MAX_TRACKED_LOCAL_WRITES = 2000;
  /** The entry key each bucket was last written under. */
  const bucketKeys = new Map<string, string>();

  /** Remember a row's first in-memory write. Repeated writes keep its sequence. */
  const noteLocalWrite = (id: string) => {
    if (localWrittenAt.has(id)) return;
    localWrittenAt.set(id, ++localWriteSeq);
    while (localWrittenAt.size > MAX_TRACKED_LOCAL_WRITES) {
      const oldest = localWrittenAt.keys().next().value;
      if (oldest === undefined) break;
      localWrittenAt.delete(oldest);
    }
  };

  const beginRead = (seq: number) => {
    inFlightReadStarts.set(seq, (inFlightReadStarts.get(seq) ?? 0) + 1);
  };

  const endRead = (seq: number) => {
    const count = inFlightReadStarts.get(seq);
    if (!count) return;
    if (count === 1) inFlightReadStarts.delete(seq);
    else inFlightReadStarts.set(seq, count - 1);
  };

  /** Drop marks no live boundary can still classify as a post-request write. */
  const pruneLocalWrites = (floor: number) => {
    // The map is insertion-ordered by sequence, so pruning is a prefix walk.
    for (const [id, seq] of localWrittenAt) {
      if (seq > floor) break;
      localWrittenAt.delete(id);
    }
  };

  const lens = createTranscriptLens();

  /**
   * The entry key of a conversation. A write whose context lacks a field the
   * sync carried (a share id) must land in the entry the sync established, so
   * the bucket's current key wins over a recomputed one.
   */
  const keyOf = (context: TranscriptContext) => {
    const key = conversationMessagesKey(context as ConversationContext);
    return bucketKeys.get(bucketOfKey(key).bucket) ?? key;
  };

  const bucketRows = (key: string) => get().dbMessagesMap[bucketOfKey(key).bucket];

  /**
   * Concurrent reads can join one query result. Register the earliest start
   * seen for it, so every settle of that result uses the most conservative
   * boundary instead of whichever fetcher resumed first.
   */
  const registerHeadBoundary = (messages: UIChatMessage[], boundary: HeadRequestStart) => {
    const existing = headRequestBoundaries.get(messages);
    if (!existing || boundary.localWriteSeqAtRequestStart < existing.localWriteSeqAtRequestStart) {
      headRequestBoundaries.set(messages, boundary);
    }
  };

  // ---- reads ---------------------------------------------------------------
  const fetchForward = async (
    context: ConversationMessageParams,
    cursor: ConversationMessagePage['nextCursor'] = null,
  ): Promise<ConversationMessageFetch> => {
    const page = cursor
      ? await readMessagesForward(lambdaClient, context, cursor)
      : await (takePrimedForwardMessagePage(context) ??
          readMessagesForward(lambdaClient, context, null, SHARED_TOPIC_FIRST_PAGE));
    return { items: page.messages, nextCursor: page.newerCursor };
  };

  const fetchHead = async (context: ConversationMessageParams): Promise<UIChatMessage[]> => {
    const syncKey = getMessageListCacheIdentity(context);
    const bucket = conversationMessagesKey(context);
    /**
     * The earliest start this fetch depends on. Later physical reads (a new
     * generation, the forced read after an intervention) keep it: a client
     * mutation may have been committed locally while its server write is still
     * in flight, so an earlier boundary is the conservative one. Rows the
     * server already knows are not in `localWrittenAt` at all, so a later read
     * still removes what it authoritatively omits.
     */
    const requestStart: HeadRequestStart = {
      idsAtRequestStart: new Set((bucketRows(bucket) ?? []).map((message) => message.id)),
      localWriteSeqAtRequestStart: localWriteSeq,
    };
    const dbMessages = bucketRows(bucket) ?? [];
    const topicAtRequest = context.topicId
      ? topicSelectors.getTopicById(context.topicId)(get())
      : undefined;
    const wasPending = hasPendingInterventions(dbMessages);
    beginRead(requestStart.localWriteSeqAtRequestStart);
    let messages: UIChatMessage[];
    try {
      messages = await runMessageListQuery(context, readConversationMessageListPage);
    } finally {
      endRead(requestStart.localWriteSeqAtRequestStart);
    }
    registerHeadBoundary(messages, requestStart);
    if (!context.syncInterventions || !context.topicId) return messages;
    if (wasPending || hasPendingInterventions(messages)) pendingInterventions.add(syncKey);
    if (!pendingInterventions.has(syncKey) || hasPendingInterventions(messages)) return messages;

    // The decision must precede the liveness read. A startup reservation is
    // still live even before runningOperation is published.
    const topic = await topicService.getTopicDetail(context.topicId);
    if (!isInterventionRunActive(topic)) {
      // Read after completion without dropping loaded history or its cursor.
      beginRead(requestStart.localWriteSeqAtRequestStart);
      try {
        messages = await runMessageListQuery(context, readConversationMessageListPage, {
          force: true,
        });
      } finally {
        endRead(requestStart.localWriteSeqAtRequestStart);
      }
      registerHeadBoundary(messages, requestStart);
    }
    const result = [...messages];
    // The copy is what `prepareHead` receives.
    registerHeadBoundary(result, requestStart);
    snapshots.set(result, { dbMessages, topic, topicAtRequest });
    return result;
  };

  const fetchOlder = async (
    context: ConversationMessageParams,
    cursor: NonNullable<ConversationMessagePage['nextCursor']>,
  ): Promise<ConversationMessageFetch> => {
    const page = await messageService.getEarlierMessages(
      {
        agentId: context.agentId,
        agentShareId: context.agentShareId,
        groupId: context.groupId,
        threadId: context.threadId,
        topicId: context.topicId,
        topicShareId: context.topicShareId,
      },
      cursor,
    );
    // Without a reported cursor, `length < pageSize` is NOT a reliable end
    // signal — the round-start trim legitimately shortens full pages — so only
    // an empty page marks the top (`applyNextPage`).
    return { items: page.messages, nextCursor: page.olderCursor };
  };

  /**
   * Fold a fetched head window into the bucket the way the conversation always
   * has: keep streamed rows and unanswered interventions during a run, and
   * keep client rows the server snapshot cannot know yet.
   */
  const prepareHead = (
    incoming: ConversationMessageFetch,
    current: ConversationMessagePage | undefined,
    context: ConversationMessageParams,
  ): ConversationMessageFetch | undefined => {
    if (!Array.isArray(incoming)) return incoming;
    // Several fetchers can join one result. The earliest request is the most
    // conservative boundary for what any of their responses can be missing.
    const requestStart = headRequestBoundaries.get(incoming);
    if (!context.topicId) return undefined;

    // Only rows written in memory after this read was issued may be missing
    // from its snapshot. Hydrated rows carry no sequence and stay out of it.
    let boundary: HeadRequestBoundary | undefined;
    if (requestStart) {
      const locallyWrittenAfterRequestStart = new Set<string>();
      for (const [id, seq] of localWrittenAt) {
        if (seq > requestStart.localWriteSeqAtRequestStart) locallyWrittenAfterRequestStart.add(id);
      }
      boundary = {
        idsAtRequestStart: requestStart.idsAtRequestStart,
        locallyWrittenAfterRequestStart,
      };
      // Nothing at or below every live/captured start can still count as a
      // post-request write for an outstanding read.
      pruneLocalWrites(
        Math.min(requestStart.localWriteSeqAtRequestStart, ...inFlightReadStarts.keys()),
      );
    }

    // DB chunk writes can lag behind pushed content, even at an equal
    // updatedAt. Keep streamed rows, but allow answers and unseen rows in.
    // A parked run must not block the first load of the conversation.
    const prevDbMessages = current?.items ?? [];
    const snapshot = snapshots.get(incoming);
    snapshots.delete(incoming);
    const chat = get();
    const currentTopic = topicSelectors.getTopicById(context.topicId)(chat);
    const ownsTopic = !!snapshot && currentTopic === snapshot.topicAtRequest;
    const completed = ownsTopic && !isInterventionRunActive(snapshot!.topic);
    const isStreaming =
      !!current &&
      operationSelectors.isAgentRuntimeRunningByContext(context)(chat) &&
      !(completed && snapshot!.dbMessages === prevDbMessages);
    const activeVoiceMessageIds = new Set(Object.keys(chat.voiceMessageUploadMap));
    const creatingMessageIds = new Set(
      prevDbMessages
        .filter((message) => operationSelectors.isMessageCreating(message.id)(chat))
        .map((message) => message.id),
    );
    const mergedMessages = isStreaming
      ? reconcileStreamingInterventions(prevDbMessages, incoming)
      : mergeFetchedMessagesWithLocalState(
          incoming,
          prevDbMessages,
          activeVoiceMessageIds,
          creatingMessageIds,
          boundary,
        );
    const dropped = isStreaming && mergedMessages === prevDbMessages;

    headResolutions.set(incoming, {
      completed,
      dropped,
      isStreaming,
      mergedMessages,
      ownsTopic,
      snapshot,
    });
    if (dropped) return undefined;

    log(
      '[head] key=%s | prevCount=%d | fetchedCount=%d',
      conversationMessagesKey(context),
      prevDbMessages.length,
      mergedMessages.length,
    );
    return { items: mergedMessages, nextCursor: getMessageListWindowOlderCursor(context) };
  };

  const slice = createReplicaSlice(conversationMessagesResource, {
    actionPrefix: 'messageTranscript',
    fetcher: (context, cursor) =>
      context.messageReadMode === 'forward'
        ? fetchForward(context, cursor)
        : cursor
          ? fetchOlder(context, cursor)
          : fetchHead(context),
    get,
    prepareHead,
    set,
    stateKey: 'messageReplica',
    toPersisted: toPersistedTranscript,
    view: {
      ...lens,
      set: (state, key, data) => {
        const { bucket } = bucketOfKey(key);
        if (data) bucketKeys.set(bucket, key);
        else if (bucketKeys.get(bucket) === key) bucketKeys.delete(bucket);
        return lens.set(state, key, data);
      },
    },
  });

  /**
   * Write a conversation's rows (memory only). An unchanged id sequence keeps
   * the entry's paging; so does `preservePaging` (a reducer edit of the same
   * window). Anything else is a fresh, unpaged transcript.
   */
  const commit = (
    context: TranscriptContext,
    messages: UIChatMessage[],
    preservePaging = false,
    clientCreatedId?: string,
  ) => {
    const key = keyOf(context);
    // Only a row a client mutation created can be missing from a read that
    // predates its server persistence. Hydration writes through the replica
    // slice and `replaceMessages` applies server data, so neither is tracked.
    if (clientCreatedId) noteLocalWrite(clientCreatedId);
    return slice.update(
      key,
      (current) =>
        current &&
        (preservePaging ||
          (current.items.length === messages.length &&
            current.items.every((item, index) => item.id === messages[index].id)))
          ? { ...current, items: messages }
          : transcriptOf(messages),
      { persist: false },
    );
  };

  /**
   * Persist a conversation once it is settled — never per streamed chunk; the
   * snapshot written at run end is the one that survives a reload.
   */
  const settle = (context: TranscriptContext) => {
    if (operationSelectors.isAgentRuntimeRunningByContext(context as ConversationContext)(get()))
      return;
    const key = keyOf(context);
    if (lens.get(get(), key)) slice.persist(key);
  };

  /**
   * Drop the transcripts of conversations that no longer exist (a deleted
   * topic, agent or group) from memory and from storage, so their rows never
   * hydrate again. Without `predicate` every transcript of the active scope
   * goes. Persisted rows an earlier session wrote are reached through the
   * replica's stored-key index. Memory-only (`m:`) entries do not survive a
   * reload, and their keys do not name the conversation, so they are left to
   * the session.
   */
  const evict = async (predicate?: (context: ConversationContext) => boolean): Promise<void> => {
    if (!predicate) {
      await slice.clear();
      return;
    }
    const matches = (key: string) => {
      const context = persistedContextOf(key);
      return !!context && predicate(context as ConversationContext);
    };
    const scope = conversationMessagesResource.scope.get();
    const loaded = new Set(lens.keys!(get()));
    for (const key of loaded) if (matches(key)) slice.remove(key);

    const persisted = await readReplicaStoredKeys(conversationMessagesResource);
    // `remove` resolves against the active scope; another identity's rows are not ours.
    if (conversationMessagesResource.scope.get() !== scope) return;
    for (const key of persisted) if (!loaded.has(key) && matches(key)) slice.remove(key);
  };

  return {
    commit,
    evict,
    headResolutions,
    keyOf,
    pendingInterventions,
    /** The entry's current value, as the replica sees it. */
    read: (key: string) => lens.get(get(), key),
    settle,
    slice,
  };
};

export type MessageTranscript = ReturnType<typeof createMessageTranscript>;

const transcripts = new WeakMap<() => ChatStore, MessageTranscript>();

/** The store's one transcript replica, shared by every message action class. */
export const getMessageTranscript = (
  set: StoreSetter<ChatStore>,
  get: () => ChatStore,
): MessageTranscript => {
  let transcript = transcripts.get(get);
  if (!transcript) transcripts.set(get, (transcript = createMessageTranscript(set, get)));
  return transcript;
};
