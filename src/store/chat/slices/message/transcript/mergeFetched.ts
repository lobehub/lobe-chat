import { type UIChatMessage } from '@lobechat/types';

import { reconcileIntervention } from '@/store/chat/utils/interventionSync';
import {
  isLocalOnlyMessage,
  mergeLocalMessagesByCreatedAt,
} from '@/store/chat/utils/localMessages';

/** What a head read can legitimately be missing, captured when it was issued. */
export interface HeadRequestBoundary {
  /** Row ids that already existed when the read was issued. */
  idsAtRequestStart: ReadonlySet<string>;
  /**
   * Row ids that entered a bucket through an in-memory write after the read was
   * issued. Rows painted from storage hydration are deliberately absent: they
   * are persisted server rows, so a server snapshot that omits one is
   * authoritative (e.g. it was deleted on another device).
   */
  locallyWrittenAfterRequestStart: ReadonlySet<string>;
}

/**
 * Merge an idle head fetch into the shown transcript.
 *
 * A fetch can be issued before a send persists its rows and resolve while
 * `sendMessage` is still waiting for the server. That window is not a running
 * agent runtime, so the optimistic user and assistant rows must be kept
 * explicitly until the server returns them; otherwise the just-sent message
 * vanishes until the run settles and refetches.
 *
 * The send operation ends as soon as the runtime takes over, while a read that
 * was already in flight can still resolve afterwards with the pre-send
 * snapshot. `boundary` covers that window: a row written in memory after the
 * read was issued cannot be absent from it on the server's behalf, so keep it
 * until a read that started after it was added says otherwise.
 */
export const mergeFetchedMessagesWithLocalState = (
  fetchedMessages: UIChatMessage[],
  localMessages: UIChatMessage[],
  activeVoiceMessageIds: ReadonlySet<string>,
  creatingMessageIds: ReadonlySet<string>,
  boundary?: HeadRequestBoundary,
): UIChatMessage[] => {
  if (localMessages.length === 0) return fetchedMessages;

  const localById = new Map(localMessages.map((message) => [message.id, message]));
  const fetchedIds = new Set(fetchedMessages.map((message) => message.id));
  let changed = false;

  const mergedMessages = fetchedMessages.map((message) => {
    const localMessage = localById.get(message.id);

    if (!localMessage) return message;
    const resolved = reconcileIntervention(localMessage, message);
    if (resolved) return resolved;
    // Once the server returns this id, its persisted row replaces the local-only preview.
    if (isLocalOnlyMessage(localMessage)) return message;
    if (localMessage.updatedAt <= message.updatedAt) return message;

    changed = true;
    return localMessage;
  });

  const missingLocalMessages = localMessages.filter(
    (message) =>
      !fetchedIds.has(message.id) &&
      ((isLocalOnlyMessage(message) && activeVoiceMessageIds.has(message.id)) ||
        creatingMessageIds.has(message.id) ||
        // Written in memory while this read was in flight: the snapshot
        // predates it. Hydrated rows are never in this set, so an old local
        // page cannot shield a row the server has already deleted.
        (!!boundary &&
          !boundary.idsAtRequestStart.has(message.id) &&
          boundary.locallyWrittenAfterRequestStart.has(message.id))),
  );

  if (missingLocalMessages.length === 0) return changed ? mergedMessages : fetchedMessages;

  return mergeLocalMessagesByCreatedAt(mergedMessages, missingLocalMessages);
};
