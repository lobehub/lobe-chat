import { FilesTabs, QueryFileListParams, SortType } from '@lobechat/types';
import { sql } from 'drizzle-orm';

import { DocumentModel } from '../../models/document';
import { FileModel } from '../../models/file';
import { documents, files, knowledgeBaseFiles } from '../../schemas';
import { LobeChatDatabase } from '../../type';

export interface KnowledgeItem {
  chunkTaskId?: string | null;
  content?: string | null;
  createdAt: Date;
  editorData?: Record<string, any> | null;
  embeddingTaskId?: string | null;
  fileType: string;
  id: string;
  metadata?: Record<string, any> | null;
  name: string;
  size: number;
  /**
   * Source type to distinguish between files and documents
   * - 'file': from files table
   * - 'document': from documents table
   */
  sourceType: 'file' | 'document';
  updatedAt: Date;
  url?: string;
}

/**
 * Knowledge Repository - combines files and documents into a unified interface
 */
export class KnowledgeRepo {
  private userId: string;
  private db: LobeChatDatabase;
  private fileModel: FileModel;
  private documentModel: DocumentModel;

  constructor(db: LobeChatDatabase, userId: string) {
    this.userId = userId;
    this.db = db;
    this.fileModel = new FileModel(db, userId);
    this.documentModel = new DocumentModel(db, userId);
  }

  /**
   * Query combined results from files and documents tables
   */
  async query({
    category,
    q,
    sortType,
    sorter,
    knowledgeBaseId,
    showFilesInKnowledgeBase,
  }: QueryFileListParams = {}): Promise<KnowledgeItem[]> {
    // Build file query
    const fileQuery = this.buildFileQuery({
      category,
      knowledgeBaseId,
      q,
      showFilesInKnowledgeBase,
      sortType,
      sorter,
    });

    // Build document query (notes)
    const documentQuery = this.buildDocumentQuery({
      category,
      knowledgeBaseId,
      q,
      sortType,
      sorter,
    });

    // Combine both queries with UNION ALL
    const combinedQuery = sql`
      (${fileQuery})
      UNION ALL
      (${documentQuery})
    `;

    // Add final ordering
    const orderClause = this.buildOrderClause(sortType, sorter);
    const finalQuery = sql`
      SELECT * FROM (${combinedQuery}) as combined
      ORDER BY ${orderClause}
    `;

    const result = await this.db.execute(finalQuery);

    const mappedResults = result.rows.map((row: any) => {
      // Parse editor_data if it's a string (raw SQL returns JSONB as string)
      let editorData = row.editor_data;
      if (typeof editorData === 'string') {
        try {
          editorData = JSON.parse(editorData);
        } catch (e) {
          console.error('[KnowledgeRepo] Failed to parse editor_data:', e);
          editorData = null;
        }
      }

      // Parse metadata if it's a string (raw SQL returns JSONB as string)
      let metadata = row.metadata;
      if (typeof metadata === 'string') {
        try {
          metadata = JSON.parse(metadata);
        } catch (e) {
          console.error('[KnowledgeRepo] Failed to parse metadata:', e);
          metadata = null;
        }
      }

      return {
        chunkTaskId: row.chunk_task_id,
        content: row.content,
        createdAt: new Date(row.created_at),
        editorData,
        embeddingTaskId: row.embedding_task_id,
        fileType: row.file_type,
        id: row.id,
        metadata,
        name: row.name,
        size: Number(row.size),
        sourceType: row.source_type,
        updatedAt: new Date(row.updated_at),
        url: row.url,
      };
    });

    return mappedResults;
  }

  /**
   * Delete item by id - routes to appropriate model based on sourceType
   */
  async deleteItem(id: string, sourceType: 'file' | 'document'): Promise<void> {
    if (sourceType === 'file') {
      await this.fileModel.delete(id);
    } else {
      await this.documentModel.delete(id);
    }
  }

  /**
   * Batch delete items
   */
  async deleteMany(items: Array<{ id: string; sourceType: 'file' | 'document' }>): Promise<void> {
    const fileIds = items.filter((item) => item.sourceType === 'file').map((item) => item.id);
    const documentIds = items
      .filter((item) => item.sourceType === 'document')
      .map((item) => item.id);

    await Promise.all([
      fileIds.length > 0 ? this.fileModel.deleteMany(fileIds) : Promise.resolve(),
      documentIds.length > 0
        ? Promise.all(documentIds.map((id) => this.documentModel.delete(id)))
        : Promise.resolve(),
    ]);
  }

  /**
   * Find item by id
   */
  async findById(id: string, sourceType: 'file' | 'document'): Promise<any> {
    if (sourceType === 'file') {
      return this.fileModel.findById(id);
    } else {
      return this.documentModel.findById(id);
    }
  }

  private buildFileQuery({
    category,
    q,
    knowledgeBaseId,
    showFilesInKnowledgeBase,
  }: QueryFileListParams = {}): ReturnType<typeof sql> {
    let whereConditions: any[] = [sql`${files.userId} = ${this.userId}`];

    // Search filter
    if (q) {
      whereConditions.push(sql`${files.name} ILIKE ${`%${q}%`}`);
    }

    // Category filter
    if (category && category !== FilesTabs.All && category !== FilesTabs.Home) {
      const fileTypePrefix = this.getFileTypePrefix(category as FilesTabs);
      if (Array.isArray(fileTypePrefix)) {
        // For multiple file types (e.g., Documents includes 'application' and 'custom')
        const orConditions = fileTypePrefix.map(
          (prefix) => sql`${files.fileType} ILIKE ${`${prefix}%`}`,
        );
        whereConditions.push(sql`(${sql.join(orConditions, sql` OR `)})`);
      } else {
        whereConditions.push(sql`${files.fileType} ILIKE ${`${fileTypePrefix}%`}`);
      }
    }

    // Knowledge base filter
    if (knowledgeBaseId) {
      // Build where conditions using proper table references (f.column instead of files.column)
      const kbWhereConditions: any[] = [sql`f.user_id = ${this.userId}`];

      // Search filter
      if (q) {
        kbWhereConditions.push(sql`f.name ILIKE ${`%${q}%`}`);
      }

      // Category filter
      if (category && category !== FilesTabs.All && category !== FilesTabs.Home) {
        const fileTypePrefix = this.getFileTypePrefix(category as FilesTabs);
        if (Array.isArray(fileTypePrefix)) {
          const orConditions = fileTypePrefix.map(
            (prefix) => sql`f.file_type ILIKE ${`${prefix}%`}`,
          );
          kbWhereConditions.push(sql`(${sql.join(orConditions, sql` OR `)})`);
        } else {
          kbWhereConditions.push(sql`f.file_type ILIKE ${`${fileTypePrefix}%`}`);
        }
      }

      return sql`
        SELECT
          f.id,
          f.name,
          f.file_type,
          f.size,
          f.url,
          f.created_at,
          f.updated_at,
          f.chunk_task_id,
          f.embedding_task_id,
          NULL as editor_data,
          NULL as content,
          NULL as metadata,
          'file' as source_type
        FROM ${files} f
        INNER JOIN ${knowledgeBaseFiles} kbf
          ON f.id = kbf.file_id
          AND kbf.knowledge_base_id = ${knowledgeBaseId}
        WHERE ${sql.join(kbWhereConditions, sql` AND `)}
      `;
    }

    // Exclude files in knowledge base if needed
    if (!showFilesInKnowledgeBase) {
      whereConditions.push(
        sql`
          NOT EXISTS (
                    SELECT 1 FROM ${knowledgeBaseFiles}
                    WHERE ${knowledgeBaseFiles.fileId} = ${files.id}
                  )
        `,
      );
    }

    return sql`
      SELECT
        id,
        name,
        file_type,
        size,
        url,
        created_at,
        updated_at,
        chunk_task_id,
        embedding_task_id,
        NULL as editor_data,
        NULL as content,
        NULL as metadata,
        'file' as source_type
      FROM ${files}
      WHERE ${sql.join(whereConditions, sql` AND `)}
    `;
  }

  private buildDocumentQuery({
    category,
    q,
    knowledgeBaseId,
  }: QueryFileListParams = {}): ReturnType<typeof sql> {
    let whereConditions: any[] = [sql`${documents.userId} = ${this.userId}`];

    // Search filter
    if (q) {
      whereConditions.push(
        sql`(${documents.title} ILIKE ${`%${q}%`} OR ${documents.filename} ILIKE ${`%${q}%`})`,
      );
    }

    // Category filter - match documents by fileType prefix
    if (category && category !== FilesTabs.All && category !== FilesTabs.Home) {
      const fileTypePrefix = this.getFileTypePrefix(category as FilesTabs);
      if (Array.isArray(fileTypePrefix)) {
        // For multiple file types (e.g., Documents includes 'application' and 'custom')
        const orConditions = fileTypePrefix.map(
          (prefix) => sql`${documents.fileType} ILIKE ${`${prefix}%`}`,
        );
        whereConditions.push(sql`(${sql.join(orConditions, sql` OR `)})`);

        // Exclude custom/document and source_type='file' from Documents category
        if (category === FilesTabs.Documents) {
          whereConditions.push(
            sql`${documents.fileType} != ${'custom/document'}`,
            sql`${documents.sourceType} != ${'file'}`,
          );
        }
      } else if (fileTypePrefix) {
        whereConditions.push(sql`${documents.fileType} ILIKE ${`${fileTypePrefix}%`}`);
      } else {
        // Exclude documents from other categories (Images, Videos, Audios, Websites)
        return sql`
          SELECT
            NULL::varchar(30) as id,
            NULL::text as name,
            NULL::varchar(255) as file_type,
            NULL::integer as size,
            NULL::text as url,
            NULL::timestamp with time zone as created_at,
            NULL::timestamp with time zone as updated_at,
            NULL::uuid as chunk_task_id,
            NULL::uuid as embedding_task_id,
            NULL::jsonb as editor_data,
            NULL::text as content,
            NULL::jsonb as metadata,
            NULL::text as source_type
          WHERE false
        `;
      }
    }

    // Knowledge base filter for documents
    // Documents don't have knowledge base association currently, so skip if knowledgeBaseId is set
    if (knowledgeBaseId) {
      return sql`
        SELECT
          NULL::varchar(30) as id,
          NULL::text as name,
          NULL::varchar(255) as file_type,
          NULL::integer as size,
          NULL::text as url,
          NULL::timestamp with time zone as created_at,
          NULL::timestamp with time zone as updated_at,
          NULL::uuid as chunk_task_id,
          NULL::uuid as embedding_task_id,
          NULL::jsonb as editor_data,
          NULL::text as content,
          NULL::jsonb as metadata,
          NULL::text as source_type
        WHERE false
      `;
    }

    return sql`
      SELECT
        id,
        COALESCE(title, filename, 'Untitled') as name,
        file_type,
        total_char_count as size,
        source as url,
        created_at,
        updated_at,
        NULL as chunk_task_id,
        NULL as embedding_task_id,
        editor_data,
        content,
        metadata,
        'document' as source_type
      FROM ${documents}
      WHERE ${sql.join(whereConditions, sql` AND `)}
    `;
  }

  private buildOrderClause(
    sortType?: string,
    sorter?: string,
  ): ReturnType<typeof sql.raw> | ReturnType<typeof sql> {
    const sortableFields: Record<string, string> = {
      createdAt: 'created_at',
      name: 'name',
      size: 'size',
      updatedAt: 'updated_at',
    };

    if (sorter && sortType && sorter in sortableFields) {
      const direction = sortType.toLowerCase() === SortType.Asc ? 'ASC' : 'DESC';
      return sql.raw(`${sortableFields[sorter]} ${direction}`);
    }

    return sql.raw('created_at DESC');
  }

  private getFileTypePrefix(category: FilesTabs): string | string[] {
    switch (category) {
      case FilesTabs.Audios: {
        return 'audio';
      }
      case FilesTabs.Documents: {
        return ['application', 'custom'];
      }
      case FilesTabs.Images: {
        return 'image';
      }
      case FilesTabs.Videos: {
        return 'video';
      }
      case FilesTabs.Websites: {
        return 'text/html';
      }
      default: {
        return '';
      }
    }
  }
}
