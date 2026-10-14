import debug from 'debug';

import type { MessageModel } from '@/database/models/message';

const log = debug('lobe-server:ai-agent-service');

export interface ResolveUserMessageParentIdParams {
  /**
   * Tail of the branch the client is rendering (`clientIds.userMessageParentId`).
   * Absent for callers that have no rendered conversation (bots, CLI, older
   * clients), which keeps the server-only spine anchoring below.
   */
  clientParentId?: string;
  threadId: string | null;
  topicId: string;
}

/**
 * Pick the parent for a fresh user turn appended to an existing topic.
 *
 * Never returns undefined for a topic that already has messages:
 * `parentId: undefined` persists a second ROOT, and the renderer walks the
 * parentId forest depth-first — an earlier root's still-growing subtree is
 * emitted before a later root, so the newest reply lands ABOVE older messages.
 *
 * The spine head (latest non-tool, non-signal message by `createdAt`) closes the
 * concurrent-append race: the client's tail can be stale when another turn was
 * persisted while the user was composing. But the newest row is not always on
 * the branch the user is viewing: after a regenerate, `activeBranchIndex` can
 * select an older sibling. Anchoring on the newest row then puts the user's turn
 * on a hidden branch, so it vanishes from the UI and the runtime — which
 * rebuilds context from the active branch — never shows it to the model
 * (LOBE-14875). So the spine head only replaces the client's tail when it
 * extends that same branch, mirroring `sendMessageInServer`.
 *
 * `getLatestSpineMessageId` skips tool rows and toolless signal turns, so it can
 * come back empty on a topic built entirely from signal callbacks; fall back to
 * the latest non-tool row rather than orphaning the turn.
 */
export const resolveUserMessageParentId = async (
  messageModel: Pick<
    MessageModel,
    'findById' | 'getLatestNonToolMessageId' | 'getLatestSpineMessageId' | 'isMessageDescendantOf'
  >,
  { clientParentId, threadId, topicId }: ResolveUserMessageParentIdParams,
): Promise<string | undefined> => {
  const spineId = await messageModel.getLatestSpineMessageId({ threadId, topicId });

  if (clientParentId) {
    if (spineId === clientParentId) return spineId;

    if (
      spineId &&
      (await messageModel.isMessageDescendantOf({
        ancestorId: clientParentId,
        descendantId: spineId,
        topicId,
      }))
    ) {
      return spineId;
    }

    // The tail is caller input: only honour it when it really belongs to this
    // conversation, otherwise a stale or foreign id would graft the turn
    // somewhere the user cannot see.
    const clientParent = await messageModel.findById(clientParentId);
    if (clientParent?.topicId === topicId && (clientParent.threadId ?? null) === threadId) {
      // A rendered tail can be a tool result; like the spine head, the turn
      // parents off the assistant that owns it, never the tool row.
      if (clientParent.role === 'tool' && clientParent.parentId) return clientParent.parentId;
      return clientParentId;
    }
  }

  if (spineId) return spineId;

  const fallbackId = await messageModel.getLatestNonToolMessageId({ threadId, topicId });
  if (fallbackId) {
    log(
      'execAgent: no spine head for topic %s, anchoring user turn on latest non-tool message %s',
      topicId,
      fallbackId,
    );
  }
  return fallbackId;
};
