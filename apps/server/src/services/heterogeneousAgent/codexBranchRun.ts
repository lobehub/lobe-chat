import {
  type CodexBranchRun,
  resolveCodexBranchRun,
} from '@lobechat/heterogeneous-agents/protocol';

import type { MessageModel } from '@/database/models/message';
import type { ThreadModel } from '@/database/models/thread';

/** A thread that {@link findCodexForkThread} identified as a Codex Fork branch. */
export type CodexForkThread = NonNullable<Awaited<ReturnType<ThreadModel['findById']>>>;

/**
 * Finds the Codex Fork branch that owns a thread-scoped run.
 *
 * Use when:
 * - Deciding whether a run's native session belongs to its thread instead of its topic.
 * Expects:
 * - The run's topic and thread identifiers.
 * Returns:
 * - The thread when it is a Codex Fork branch of this topic; undefined for every other
 *   thread, which keeps the topic-scoped session binding.
 */
export const findCodexForkThread = async (
  threadModel: Pick<ThreadModel, 'findById'>,
  topicId: string,
  threadId: string,
): Promise<CodexForkThread | undefined> => {
  const thread = await threadModel.findById(threadId);
  if (!thread || thread.topicId !== topicId || !thread.metadata?.codexForkTarget) return;
  return thread;
};

/**
 * Resolves a device branch from its durable origin and its own message ancestry.
 *
 * Use when:
 * - Dispatching the first native Fork or continuing a saved child after refresh/reconnect.
 * Expects:
 * - A Codex Fork thread from {@link findCodexForkThread} and the current user message
 *   identifier.
 * Returns:
 * - An exact native boundary/resume token, or an explicit lost-child rejection.
 *
 * Call stack:
 *
 * heteroDispatch
 *   -> HeterogeneousAgentService.getCodexBranchRun
 *     -> {@link resolveDeviceCodexBranchRun}
 *       -> {@link resolveCodexBranchRun}
 */
export const resolveDeviceCodexBranchRun = async (
  messageModel: Pick<MessageModel, 'findById'>,
  thread: CodexForkThread,
  messageId: string,
): Promise<CodexBranchRun> => {
  const { id: threadId, topicId } = thread;
  const origin = thread.metadata?.codexForkTarget;
  if (!origin) return { codexBranchError: 'Native branch is unavailable' };
  // Read the actual ancestry rather than a paginated transcript, which can omit the durable child handoff.
  const messages: Parameters<typeof resolveCodexBranchRun>[0]['messages'][number][] = [];
  const visited = new Set<string>();
  let currentId: string | null | undefined = messageId;
  while (currentId && !visited.has(currentId)) {
    visited.add(currentId);
    const message = await messageModel.findById(currentId);
    if (!message || message.topicId !== topicId || message.threadId !== threadId) break;
    messages.push({
      id: currentId,
      metadata: message.metadata,
      parentId: message.parentId,
      threadId: message.threadId,
      role: message.role,
      content: message.content,
      error: message.error,
      // A tool-only answer has already used the branch even without assistant text.
      tools: Array.isArray(message.tools) ? message.tools : undefined,
    });
    if (message.metadata?.heteroSessionId && message.metadata.heteroSessionId !== origin.threadId)
      break;
    currentId = message.parentId;
  }
  return resolveCodexBranchRun({
    messageId,
    messages,
    resumeSessionId: thread.metadata?.heteroSessionId,
    thread: { id: threadId, metadata: thread.metadata },
  });
};
