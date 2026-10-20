import type { LobeChatDatabase } from '@/database/type';
import { DocumentService } from '@/server/services/document';
import type {
  DocumentHistoryAttribution,
  DocumentHistorySaveSource,
} from '@/server/services/document/types';
import { getResourceMeta } from '@/server/services/resourcePermission';

import { toStoredMarkdown } from './editorData';
import { projectPageState } from './fork';

export class PageProjectionRejectedError extends Error {
  constructor(documentId: string) {
    super(`Refusing to persist page ${documentId}: the room holds blocks the projection lost`);
    this.name = 'PageProjectionRejectedError';
  }
}

/**
 * Writes a room state to the stored page, the one place a collaborative page's
 * body reaches the `documents` row. The saved version is recorded under
 * `saveSource`, attributed to `history`.
 */
export const persistPageState = async (
  db: LobeChatDatabase,
  documentId: string,
  state: Uint8Array,
  options: { history?: DocumentHistoryAttribution; saveSource: DocumentHistorySaveSource },
): Promise<boolean> => {
  const meta = await getResourceMeta(db, 'document', documentId);
  if (!meta) return false;

  const { editorData, lostBlocks, markdown, title } = await projectPageState(state);
  // A binding that fails to read the room exports an empty page; writing it
  // would erase the stored body and the version history's latest state.
  if (lostBlocks) throw new PageProjectionRejectedError(documentId);

  const service = new DocumentService(db, meta.userId, meta.workspaceId ?? undefined);
  const row = await service.getDocumentById(documentId);
  if (!row) return false;

  await service.updateDocument(documentId, {
    content: toStoredMarkdown(row, markdown),
    editorData: editorData as unknown as Record<string, unknown>,
    history: options.history,
    origin: 'room-projection',
    saveSource: options.saveSource,
    ...(title ? { title } : {}),
  });
  return true;
};
