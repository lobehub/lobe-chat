import { type DocumentStore, useDocumentStore } from '@/store/document';

/**
 * Whether the open page has loaded. Its kind (HTML or rich text) decides which
 * page tools the copilot gets, so the copilot holds sending until then — before
 * it loads, an HTML page would be sent with the rich-text tools.
 */
export const isPageDocumentLoaded = (
  state: Pick<DocumentStore, 'documentDetailMap'>,
  documentId: string | undefined,
) => !documentId || !!state.documentDetailMap[documentId]?.document;

export const usePageDocumentLoaded = (documentId: string | undefined) =>
  useDocumentStore((s) => isPageDocumentLoaded(s, documentId));
