import type { HeadlessEditor } from '@lobehub/editor/headless';
import { TRPCError } from '@trpc/server';

import type { DocumentHistorySaveSource } from '@/server/services/document/types';

/** An editable copy of a page. Tools edit it, then the session commits it back. */
export interface PageDraft {
  destroy: () => void;
  editor: HeadlessEditor;
  /**
   * LiteXML id → an id that stays the same across sessions of the page. Empty
   * when the LiteXML ids are already stable, as they are for a stored page.
   */
  stableIds: () => Map<string, string>;
}

export interface PageSession {
  /**
   * Writes the draft back. Resolves false when nothing changed; rejects with
   * {@link PageChangedError} when the page changed after the session read it.
   */
  commit: () => Promise<boolean>;
  draft: PageDraft;
  setTitle: (title: string) => void;
  readonly title: string;
}

/** Where page edits are read from and written back to: the live room or the stored row. */
export interface PageSessions {
  openSession: (documentId: string) => Promise<PageSession>;
}

/** Who makes an edit, recorded on the version it produces. */
export interface PageWriter {
  agentId?: string;
  /** The agent run; all its edits share one `llm_call` version. */
  operationId?: string;
  saveSource: DocumentHistorySaveSource;
  userId: string;
  workspaceId?: string;
}

export const historyAttributionOf = (writer: PageWriter) => ({
  agentId: writer.agentId,
  editorIds: [writer.userId],
  operationId: writer.operationId,
});

export class PageChangedError extends Error {
  constructor(readonly reason: 'changed' | 'locked') {
    super(
      reason === 'locked'
        ? 'The page is being edited by another member'
        : 'The page changed after it was read',
    );
    this.name = 'PageChangedError';
  }
}

/** Maps the document service's CONFLICT errors onto {@link PageChangedError}. */
export const toPageChangedError = (error: unknown): PageChangedError | undefined => {
  if (!(error instanceof TRPCError) || error.code !== 'CONFLICT') return;
  const code = (error.cause as { data?: { code?: string } } | undefined)?.data?.code;
  if (code === 'DocumentVersionMismatch') return new PageChangedError('changed');
  if (code === 'DocumentLocked') return new PageChangedError('locked');
};
