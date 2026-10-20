'use client';

import { useEffect } from 'react';

import { useChatStore } from '@/store/chat';
import type { ChatStoreState } from '@/store/chat/initialState';
import { gatewayFeedSelectors, topicSelectors } from '@/store/chat/selectors';
import { hasLocalTopicRun } from '@/store/chat/slices/topic/topicDetail';

const currentOperationId = (topicId: string) =>
  topicSelectors.getTopicById(topicId)(useChatStore.getState())?.metadata?.runningOperation
    ?.operationId;

/**
 * The newest main-line run of `topicId` the gateway hub reports as running.
 * Thread and child runs never own the topic's `runningOperation` marker.
 */
export const latestRunningTopicOperation =
  (topicId: string) =>
  (s: ChatStoreState): string | undefined => {
    let latest: { at: number; operationId: string } | undefined;
    for (const [operationId, entry] of Object.entries(gatewayFeedSelectors.gatewayFeed(s))) {
      const { meta, status } = entry;
      if (status !== 'running' || meta?.topicId !== topicId) continue;
      if (meta.threadId || meta.parentOperationId) continue;
      if (!latest || entry.at > latest.at) latest = { at: entry.at, operationId };
    }
    return latest?.operationId;
  };

/**
 * The hub announces a run at gateway init, which precedes the server writing
 * the topic's `runningOperation` marker; re-read the detail until it lands.
 */
export const MARKER_RETRY_DELAYS = [0, 500, 1500, 3000];

const isHandled = (topicId: string, operationId: string) =>
  // This client started the run, already streams it, or holds its marker.
  hasLocalTopicRun(useChatStore.getState(), topicId) || currentOperationId(topicId) === operationId;

/**
 * Pick up a run another client started on this topic. Re-reading the topic
 * detail installs its `runningOperation` marker, which `useGatewayReconnect`
 * attaches to with full replay; the message refetch brings the new user turn.
 */
export const syncRemoteTopicRun = async (params: {
  agentId: string;
  operationId: string;
  signal?: AbortSignal;
  topicId: string;
}): Promise<void> => {
  const { agentId, operationId, signal, topicId } = params;
  if (isHandled(topicId, operationId)) return;

  const messages = useChatStore.getState().refreshMessages({ agentId, topicId });
  for (const delay of MARKER_RETRY_DELAYS) {
    if (delay) await new Promise((resolve) => setTimeout(resolve, delay));
    if (signal?.aborted) break;
    await useChatStore.getState().refreshTopicDetail(topicId, true);
    if (isHandled(topicId, operationId)) break;
  }
  await messages;
};

/**
 * Follow runs started on another device while a conversation shows the topic.
 * The per-user gateway socket already broadcasts every operation's lifecycle
 * (`op_lifecycle`, mirrored into `gatewayFeed`) whether or not this client
 * subscribed to it, so a new running operation on this topic is the signal.
 */
export const useTopicRunEvents = (topicId: string | null | undefined, agentId?: string) => {
  const operationId = useChatStore((s) =>
    topicId ? latestRunningTopicOperation(topicId)(s) : undefined,
  );

  useEffect(() => {
    if (!topicId || !agentId || !operationId) return;

    const ac = new AbortController();
    syncRemoteTopicRun({ agentId, operationId, signal: ac.signal, topicId }).catch((error) => {
      console.error('[TopicRunEvents] Failed to sync remote run:', error);
    });
    return () => ac.abort();
  }, [agentId, operationId, topicId]);
};
