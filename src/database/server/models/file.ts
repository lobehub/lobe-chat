import { asc, eq, ilike, inArray, notExists } from 'drizzle-orm';
import { and, desc } from 'drizzle-orm/expressions';

import { serverDB } from '@/database/server/core/db';
import { FilesTabs, QueryFileListParams, SortType } from '@/types/files';

import {
  FileItem,
  NewFile,
  NewGlobalFile,
  files,
  globalFiles,
  knowledgeBaseFiles,
} from '../schemas/lobechat';

export class FileModel {
  private readonly userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  create = async (params: Omit<NewFile, 'id' | 'userId'> & { knowledgeBaseId?: string }) => {
    const result = await serverDB.transaction(async (trx) => {
      const result = await trx
        .insert(files)
        .values({ ...params, userId: this.userId })
        .returning();

      const item = result[0];

      if (params.knowledgeBaseId) {
        await trx
          .insert(knowledgeBaseFiles)
          .values({ fileId: item.id, knowledgeBaseId: params.knowledgeBaseId });
      }

      return item;
    });

    return { id: result.id };
  };

  createGlobalFile = async (file: Omit<NewGlobalFile, 'id' | 'userId'>) => {
    return serverDB.insert(globalFiles).values(file).returning();
  };

  checkHash = async (hash: string) => {
    const item = await serverDB.query.globalFiles.findFirst({
      where: eq(globalFiles.hashId, hash),
    });
    if (!item) return { isExist: false };

    return {
      fileType: item.fileType,
      isExist: true,
      metadata: item.metadata,
      size: item.size,
      url: item.url,
    };
  };

  delete = async (id: string) => {
    return serverDB.delete(files).where(and(eq(files.id, id), eq(files.userId, this.userId)));
  };

  deleteMany = async (ids: string[]) => {
    return serverDB.delete(files).where(and(inArray(files.id, ids), eq(files.userId, this.userId)));
  };

  clear = async () => {
    return serverDB.delete(files).where(eq(files.userId, this.userId));
  };

  query = async ({
    category,
    q,
    sortType,
    sorter,
    knowledgeBaseId,
    showFilesInKnowledgeBase,
  }: QueryFileListParams = {}) => {
    // 1. query where
    let whereClause = and(
      q ? ilike(files.name, `%${q}%`) : undefined,
      eq(files.userId, this.userId),
    );
    if (category && category !== FilesTabs.All) {
      const fileTypePrefix = this.getFileTypePrefix(category as FilesTabs);
      whereClause = and(whereClause, ilike(files.fileType, `${fileTypePrefix}%`));
    }

    // 2. order part

    let orderByClause = desc(files.createdAt);
    // create a map for sortable fields
    const sortableFields = {
      createdAt: files.createdAt,
      name: files.name,
      size: files.size,
      updatedAt: files.updatedAt,
    } as const;
    type SortableField = keyof typeof sortableFields;

    if (sorter && sortType && sorter in sortableFields) {
      const sortFunction = sortType.toLowerCase() === SortType.Asc ? asc : desc;
      orderByClause = sortFunction(sortableFields[sorter as SortableField]);
    }

    // 3. build query
    let query = serverDB
      .select({
        chunkTaskId: files.chunkTaskId,
        createdAt: files.createdAt,
        embeddingTaskId: files.embeddingTaskId,
        fileType: files.fileType,
        id: files.id,
        name: files.name,
        size: files.size,
        updatedAt: files.updatedAt,
        url: files.url,
      })
      .from(files);

    // 4. add knowledge base query
    if (knowledgeBaseId) {
      // if knowledgeBaseId is provided, it means we are querying files in a knowledge-base

      // @ts-ignore
      query = query.innerJoin(
        knowledgeBaseFiles,
        and(
          eq(files.id, knowledgeBaseFiles.fileId),
          eq(knowledgeBaseFiles.knowledgeBaseId, knowledgeBaseId),
        ),
      );
    }
    // 5.if we don't show files in knowledge base, we need exclude files in knowledge base
    else if (!showFilesInKnowledgeBase) {
      whereClause = and(
        whereClause,
        notExists(
          serverDB.select().from(knowledgeBaseFiles).where(eq(knowledgeBaseFiles.fileId, files.id)),
        ),
      );
    }

    // or we are just filter in the global files
    return query.where(whereClause).orderBy(orderByClause);
  };

  findById = async (id: string) => {
    return serverDB.query.files.findFirst({
      where: and(eq(files.id, id), eq(files.userId, this.userId)),
    });
  };

  async update(id: string, value: Partial<FileItem>) {
    return serverDB
      .update(files)
      .set({ ...value, updatedAt: new Date() })
      .where(and(eq(files.id, id), eq(files.userId, this.userId)));
  }

  /**
   * get the corresponding file type prefix according to FilesTabs
   */
  private getFileTypePrefix = (category: FilesTabs): string => {
    switch (category) {
      case FilesTabs.Audios: {
        return 'audio';
      }
      case FilesTabs.Documents: {
        return 'application';
      }
      case FilesTabs.Images: {
        return 'image';
      }
      case FilesTabs.Videos: {
        return 'video';
      }
      default: {
        return '';
      }
    }
  };
}
