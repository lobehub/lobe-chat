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

export const documentSelectors = {
  getDocumentById,
};
