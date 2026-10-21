import { HTML_DOCUMENT_FILE_TYPE } from '@lobechat/const';
import type { BuiltinToolResolveContext } from '@lobechat/types';

import { DocumentModel } from '@/database/models/document';

import type { ExecRunContext } from '../../types';
import type { ToolDiscoveryDeps } from './types';

/**
 * The kind of page a page-scoped run is editing, so the page tool exposes only
 * the APIs that apply to it (raw HTML vs node tree). Unknown outside page scope
 * or when the page cannot be read — the tool then keeps its node APIs.
 */
export const resolvePageDocumentType = async (
  deps: Pick<ToolDiscoveryDeps, 'db' | 'userId' | 'workspaceId'>,
  appContext: ExecRunContext['appContext'],
): Promise<BuiltinToolResolveContext['pageDocumentType']> => {
  if (appContext?.scope !== 'page' || !appContext.documentId) return undefined;

  const document = await new DocumentModel(deps.db, deps.userId, deps.workspaceId)
    .findById(appContext.documentId)
    .catch(() => undefined);
  if (!document) return undefined;

  return document.fileType === HTML_DOCUMENT_FILE_TYPE ? 'html' : 'rich-text';
};
