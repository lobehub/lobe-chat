import type { LobeChatDatabase } from '@/database/type';
import { DocumentService } from '@/server/services/document';
import { canPerformResourceAction, getResourceMeta } from '@/server/services/resourcePermission';
import { isSkillMarkdownDocument } from '@/utils/skillMarkdown';

import { isPageCollabEnabled } from './config';
import { DbPageSessions } from './dbSession';
import { RoomPageSessions } from './roomSession';
import type { PageSessions, PageWriter } from './session';

export type PageAccess = 'edit' | 'none' | 'view';

/**
 * Page edits go through the live room when collaboration is on, else to the
 * stored row. A SKILL.md never joins a room: its editor saves the frontmatter
 * alongside the body over HTTP, which a room would overwrite.
 */
export const createPageSessions = (db: LobeChatDatabase, writer: PageWriter): PageSessions => {
  const stored = new DbPageSessions(db, writer);
  if (!isPageCollabEnabled()) return stored;

  const room = new RoomPageSessions(db, writer);
  const documents = new DocumentService(db, writer.userId, writer.workspaceId);
  return {
    openSession: async (documentId) => {
      const row = await documents.getDocumentById(documentId);
      return row && isSkillMarkdownDocument(row)
        ? stored.openSession(documentId)
        : room.openSession(documentId);
    },
  };
};

export const resolvePageAccess = async (
  db: LobeChatDatabase,
  userId: string,
  documentId: string,
): Promise<PageAccess> => {
  const meta = await getResourceMeta(db, 'document', documentId);
  if (!meta) return 'none';
  if (!meta.workspaceId) return meta.userId === userId ? 'edit' : 'none';

  const can = (action: 'edit' | 'view') =>
    canPerformResourceAction({
      action,
      db,
      meta,
      resourceId: documentId,
      resourceType: 'document',
      userId,
      workspaceId: meta.workspaceId!,
    });

  if (await can('edit')) return 'edit';
  return (await can('view')) ? 'view' : 'none';
};

export { isPageCollabEnabled } from './config';
export { editorDataFromRow } from './editorData';
export { openPageFork, projectPageState } from './fork';
export { persistPageState } from './persist';
export { createPageRoomClient } from './roomClient';
export { PageCollabUnavailableError } from './roomSession';
export * from './session';
