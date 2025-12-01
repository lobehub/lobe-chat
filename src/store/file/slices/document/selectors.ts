import { LobeDocument } from '@/types/document';

import { FilesStoreState } from '../../initialState';

const getDocumentById = (documentId: string | undefined) => (s: FilesStoreState) => {
  if (!documentId) return undefined;

  // First check local optimistic map
  const localDocument = s.localDocumentMap.get(documentId);

  // Then check server documents
  const serverDocument = s.documents.find((doc) => doc.id === documentId);

  // If both exist, prefer the local update if it's newer
  if (localDocument && serverDocument) {
    return new Date(localDocument.updatedAt) >= new Date(serverDocument.updatedAt)
      ? localDocument
      : serverDocument;
  }

  // Return whichever exists, or undefined if neither exists
  return localDocument || serverDocument;
};

const getFilteredPages = (s: FilesStoreState): LobeDocument[] => {
  // Merge local optimistic map with server documents
  const localPages = Array.from(s.localDocumentMap.values());
  const serverPages = s.documents.filter((doc) => !s.localDocumentMap.has(doc.id));
  const pages = [...localPages, ...serverPages];

  const { searchKeywords } = s;

  let result = pages;

  // Filter by search keywords
  if (searchKeywords.trim()) {
    const lowerKeywords = searchKeywords.toLowerCase();
    result = pages.filter((page: LobeDocument) => {
      const content = page.content?.toLowerCase() || '';
      const title = page.title?.toLowerCase() || '';
      return content.includes(lowerKeywords) || title.includes(lowerKeywords);
    });
  }

  // Sort by creation date (newest first)
  return result.sort((a: LobeDocument, b: LobeDocument) => {
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return dateB - dateA;
  });
};

export const documentSelectors = {
  getDocumentById,
  getFilteredPages,
};
