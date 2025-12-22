import type { NotebookStore } from './store';

const getDocumentById =
  (topicId: string | undefined, documentId: string | undefined) => (s: NotebookStore) => {
    if (!topicId || !documentId) return null;
    const docs = s.documentsMap[topicId];
    if (!docs) return null;
    return docs.find((d) => d.id === documentId) || null;
  };

const getDocumentsByTopicId = (topicId: string | undefined) => (s: NotebookStore) => {
  if (!topicId) return [];
  return s.documentsMap[topicId] || [];
};

const hasDocuments = (topicId: string | undefined) => (s: NotebookStore) => {
  if (!topicId) return false;
  const docs = s.documentsMap[topicId];
  return docs && docs.length > 0;
};

export const notebookSelectors = {
  getDocumentById,
  getDocumentsByTopicId,
  hasDocuments,
};
