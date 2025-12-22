import { DocumentType } from '@lobechat/builtin-tool-notebook';

import { lambdaClient } from '@/libs/trpc/client';

interface CreateDocumentParams {
  content: string;
  description: string;
  title: string;
  topicId: string;
  type?: DocumentType;
}

interface UpdateDocumentParams {
  append?: boolean;
  content?: string;
  id: string;
  title?: string;
}

interface ListDocumentsParams {
  topicId: string;
  type?: DocumentType;
}

class NotebookService {
  createDocument = async (params: CreateDocumentParams) => {
    return lambdaClient.notebook.createDocument.mutate(params);
  };

  updateDocument = async (params: UpdateDocumentParams) => {
    return lambdaClient.notebook.updateDocument.mutate(params);
  };

  getDocument = async (id: string) => {
    return lambdaClient.notebook.getDocument.query({ id });
  };

  listDocuments = async (params: ListDocumentsParams) => {
    return lambdaClient.notebook.listDocuments.query(params);
  };

  deleteDocument = async (id: string) => {
    return lambdaClient.notebook.deleteDocument.mutate({ id });
  };
}

export const notebookService = new NotebookService();
