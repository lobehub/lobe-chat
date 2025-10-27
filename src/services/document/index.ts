import { DocumentItem } from '@lobechat/database/schemas';

import { lambdaClient } from '@/libs/trpc/client';

export interface CreateNoteParams {
  content: string;
  fileType?: string;
  knowledgeBaseId?: string;
  metadata?: Record<string, any>;
  title: string;
}

export interface UpdateDocumentParams {
  content?: string;
  id: string;
  title?: string;
}

export class DocumentService {
  async createNote(params: CreateNoteParams): Promise<DocumentItem> {
    return lambdaClient.document.createNote.mutate(params);
  }

  async queryDocuments(): Promise<DocumentItem[]> {
    return lambdaClient.document.queryDocuments.query();
  }

  async getDocumentById(id: string): Promise<DocumentItem | undefined> {
    return lambdaClient.document.getDocumentById.query({ id });
  }

  async deleteDocument(id: string): Promise<void> {
    await lambdaClient.document.deleteDocument.mutate({ id });
  }

  async updateDocument(params: UpdateDocumentParams): Promise<void> {
    await lambdaClient.document.updateDocument.mutate(params);
  }
}

export const documentService = new DocumentService();
