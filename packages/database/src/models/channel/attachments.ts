import { asc, inArray } from 'drizzle-orm';

import { channelMessageFiles } from '../../schemas';
import type { Transaction } from '../../type';

/** Records a new message's attachments in the order the sender gave them. */
export const attachFiles = async (
  tx: Transaction,
  params: { channelId: string; fileIds: string[]; messageId: string },
) => {
  const { channelId, fileIds, messageId } = params;
  if (!fileIds.length) return;

  await tx
    .insert(channelMessageFiles)
    .values(fileIds.map((fileId, sortOrder) => ({ channelId, fileId, messageId, sortOrder })));
};

/**
 * Attachment ids per message, in attachment order. A file deleted since the message was sent
 * is no longer listed: the cascade removed its row.
 */
export const fileIdsByMessage = async (tx: Transaction, messageIds: string[]) => {
  const result = new Map<string, string[]>();
  if (!messageIds.length) return result;

  const rows = await tx
    .select({ fileId: channelMessageFiles.fileId, messageId: channelMessageFiles.messageId })
    .from(channelMessageFiles)
    .where(inArray(channelMessageFiles.messageId, messageIds))
    .orderBy(asc(channelMessageFiles.messageId), asc(channelMessageFiles.sortOrder));
  for (const { fileId, messageId } of rows) {
    const list = result.get(messageId);
    if (list) list.push(fileId);
    else result.set(messageId, [fileId]);
  }

  return result;
};
