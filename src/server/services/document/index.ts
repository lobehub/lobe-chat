import { LobeChatDatabase } from '@lobechat/database';
import { DocumentItem, documents, files } from '@lobechat/database/schemas';
import { loadFile } from '@lobechat/file-loaders';
import { and, eq } from 'drizzle-orm';
import debug from 'debug';

import { DocumentModel } from '@/database/models/document';
import { FileModel } from '@/database/models/file';
import { LobeDocument } from '@/types/document';

import { FileService } from '../file';

const log = debug('lobe-chat:service:document');

export class DocumentService {
  userId: string;
  private fileModel: FileModel;
  private documentModel: DocumentModel;
  private fileService: FileService;
  private db: LobeChatDatabase;

  constructor(db: LobeChatDatabase, userId: string) {
    this.userId = userId;
    this.db = db;
    this.fileModel = new FileModel(db, userId);
    this.fileService = new FileService(db, userId);
    this.documentModel = new DocumentModel(db, userId);
  }

  /**
   * Create a document
   */
  async createDocument(params: {
    content?: string;
    editorData: Record<string, any>;
    fileType?: string;
    knowledgeBaseId?: string;
    metadata?: Record<string, any>;
    parentId?: string;
    rawData?: string;
    slug?: string;
    title: string;
  }): Promise<DocumentItem> {
    const {
      content,
      editorData,
      title,
      fileType = 'custom/document',
      metadata,
      knowledgeBaseId,
      parentId,
      slug,
    } = params;

    // Calculate character and line counts
    const totalCharCount = content?.length || 0;
    const totalLineCount = content?.split('\n').length || 0;

    let fileId: string | null = null;

    // If creating in a knowledge base, create a corresponding file record
    if (knowledgeBaseId) {
      const file = await this.fileModel.create(
        {
          fileType,
          knowledgeBaseId,
          metadata,
          name: title,
          parentId,
          size: totalCharCount,
          url: `internal://document/placeholder`, // Placeholder URL
        },
        false, // Do not insert to global files
      );
      fileId = file.id;
    }

    const document = await this.documentModel.create({
      content,
      editorData,
      fileId,
      fileType,
      filename: title,
      metadata,
      pages: undefined,
      parentId,
      slug,
      source: 'document',
      sourceType: 'api',
      title,
      totalCharCount,
      totalLineCount,
    });

    return document;
  }

  /**
   * Query all documents
   */
  async queryDocuments() {
    return this.documentModel.query();
  }

  /**
   * Get document by ID
   */
  async getDocumentById(id: string) {
    return this.documentModel.findById(id);
  }

  /**
   * Delete document (recursively deletes children if it's a folder)
   */
  async deleteDocument(id: string) {
    const document = await this.documentModel.findById(id);
    if (!document) return;

    // If it's a folder, recursively delete all children first
    if (document.fileType === 'custom/folder') {
      const children = await this.db.query.documents.findMany({
        where: eq(documents.parentId, id),
      });

      // Recursively delete all children
      for (const child of children) {
        await this.deleteDocument(child.id);
      }

      // Also delete all files in this folder
      const childFiles = await this.db.query.files.findMany({
        where: and(eq(files.parentId, id), eq(files.userId, this.userId)),
      });

      for (const file of childFiles) {
        await this.fileModel.delete(file.id);
      }
    }

    // Delete the associated file record if it exists
    if (document.fileId) {
      await this.fileModel.delete(document.fileId);
    }

    // Finally delete the document itself
    return this.documentModel.delete(id);
  }

  /**
   * Update document
   */
  async updateDocument(
    id: string,
    params: {
      content?: string;
      editorData?: Record<string, any>;
      metadata?: Record<string, any>;
      title?: string;
    },
  ) {
    const updates: any = {};

    if (params.content !== undefined) {
      updates.content = params.content;
      updates.totalCharCount = params.content.length;
      updates.totalLineCount = params.content.split('\n').length;
    }

    if (params.editorData !== undefined) {
      updates.editorData = params.editorData;
    }

    if (params.title !== undefined) {
      updates.title = params.title;
      updates.filename = params.title;
    }

    if (params.metadata !== undefined) {
      updates.metadata = params.metadata;
    }

    return this.documentModel.update(id, updates);
  }

  /**
   * 解析文件内容
   *
   */
  async parseFile(fileId: string): Promise<LobeDocument> {
    const { filePath, file, cleanup } = await this.fileService.downloadFileToLocal(fileId);

    const logPrefix = `[${file.name}]`;
    log(`${logPrefix} 开始解析文件, 路径: ${filePath}`);

    try {
      // 使用loadFile加载文件内容
      const fileDocument = await loadFile(filePath);

      log(`${logPrefix} 文件解析成功 %O`, {
        fileType: fileDocument.fileType,
        size: fileDocument.content.length,
      });

      const document = await this.documentModel.create({
        content: fileDocument.content,
        fileId,
        fileType: file.fileType,
        metadata: fileDocument.metadata,
        pages: fileDocument.pages,
        parentId: file.parentId,
        source: file.url,
        sourceType: 'file',
        title: fileDocument.metadata?.title,
        totalCharCount: fileDocument.totalCharCount,
        totalLineCount: fileDocument.totalLineCount,
      });

      return document as LobeDocument;
    } catch (error) {
      console.error(`${logPrefix} 文件解析失败:`, error);
      throw error;
    } finally {
      cleanup();
    }
  }
}
