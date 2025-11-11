import { LobeChatDatabase } from '@lobechat/database';
import { DocumentItem } from '@lobechat/database/schemas';
import { loadFile } from '@lobechat/file-loaders';
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
    rawData?: string;
    title: string;
  }): Promise<DocumentItem> {
    const {
      content,
      editorData,
      title,
      fileType = 'custom/document',
      metadata,
      knowledgeBaseId,
    } = params;

    // Calculate character and line counts
    const totalCharCount = content?.length || 0;
    const totalLineCount = content?.split('\n').length || 0;

    const document = await this.documentModel.create({
      content,
      editorData,
      fileId: knowledgeBaseId ? null : undefined,
      fileType,
      filename: title,
      metadata,
      pages: undefined,
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
   * Delete document
   */
  async deleteDocument(id: string) {
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
