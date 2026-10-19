import { HTML_DOCUMENT_FILE_TYPE } from '@lobechat/const';
import type { BuiltinToolResolveContext } from '@lobechat/types';

import { getDocumentStoreState } from '@/store/document';
import { pageAgentRuntime } from '@/store/tool/slices/builtin/executors/pageAgentRuntime';

/**
 * The kind of page a page-scoped run edits. An HTML page renders in a sandboxed
 * frame with no editor mounted: its page tool exposes only the HTML APIs and no
 * editor content is injected. `undefined` outside page scope or before the page loads.
 */
export const resolveClientPageDocumentType = (
  scope: string | undefined,
  documentId: string | undefined,
): BuiltinToolResolveContext['pageDocumentType'] => {
  if (scope !== 'page') return undefined;
  const id = documentId ?? pageAgentRuntime.getCurrentDocId();
  if (!id) return undefined;
  const document = getDocumentStoreState().documentDetailMap[id]?.document;
  // Not loaded yet: unknown, never a guess (the copilot holds sending until the
  // page is known, see `isPageDocumentLoaded`).
  if (!document) return undefined;
  return document.fileType === HTML_DOCUMENT_FILE_TYPE ? 'html' : 'rich-text';
};
