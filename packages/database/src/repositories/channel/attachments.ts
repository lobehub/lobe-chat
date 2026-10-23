import { asc, inArray } from 'drizzle-orm';

import { messagesFiles } from '../../schemas';
import type { Transaction } from '../../type';

/**
 * Records a new message's attachments in the order the sender gave them. Performs no access
 * check: the caller must already have authorized every file for the sender
 * (`sendMessage` in `send.ts` does, under the channel lock).
 */
export const attachFiles = async (
  tx: Transaction,
  params: { fileIds: string[]; messageId: string; workspaceId: string | null },
) => {
  const { fileIds, messageId, workspaceId } = params;
  if (!fileIds.length) return;

  await tx.insert(messagesFiles).values(
    fileIds.map((fileId, sortOrder) => ({
      fileId,
      messageId,
      sortOrder,
      userId: null,
      workspaceId,
    })),
  );
};

/**
 * Attachment ids per message, in attachment order. A file deleted since the message was sent
 * is no longer listed: the cascade removed its row.
 */
export const fileIdsByMessage = async (tx: Transaction, messageIds: string[]) => {
  const result = new Map<string, string[]>();
  if (!messageIds.length) return result;

  const rows = await tx
    .select({ fileId: messagesFiles.fileId, messageId: messagesFiles.messageId })
    .from(messagesFiles)
    .where(inArray(messagesFiles.messageId, messageIds))
    .orderBy(asc(messagesFiles.messageId), asc(messagesFiles.sortOrder));
  for (const { fileId, messageId } of rows) {
    const list = result.get(messageId);
    if (list) list.push(fileId);
    else result.set(messageId, [fileId]);
  }

  return result;
};
