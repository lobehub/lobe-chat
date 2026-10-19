import { HTML_DOCUMENT_FILE_TYPE } from '@lobechat/const';
import type { BuiltinToolResolveContext } from '@lobechat/types';

import { getDocumentStoreState } from '@/store/document';
import { pageAgentRuntime } from '@/store/tool/slices/builtin/executors/pageAgentRuntime';

/**
 * The kind of page a page-scoped run edits. An HTML page renders in a sandboxed
 * frame with no editor mounted: its page tool exposes only the HTML APIs and no
 * editor content is injected. `undefined` outside page scope.
 */
export const resolveClientPageDocumentType = (
  scope: string | undefined,
  documentId: string | undefined,
): BuiltinToolResolveContext['pageDocumentType'] => {
  if (scope !== 'page') return undefined;
  const id = documentId ?? pageAgentRuntime.getCurrentDocId();
  if (!id) return undefined;
  const fileType = getDocumentStoreState().documentDetailMap[id]?.document?.fileType;
  return fileType === HTML_DOCUMENT_FILE_TYPE ? 'html' : 'rich-text';
};
