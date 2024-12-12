import { asc, count, eq, ilike, inArray, notExists, or, sum } from 'drizzle-orm';
import { and, desc, like } from 'drizzle-orm/expressions';
import type { PgTransaction } from 'drizzle-orm/pg-core';

import { LobeChatDatabase } from '@/database/type';
import { FilesTabs, QueryFileListParams, SortType } from '@/types/files';

import {
  FileItem,
  NewFile,
  NewGlobalFile,
  chunks,
  embeddings,
  fileChunks,
  files,
  globalFiles,
  knowledgeBaseFiles,
} from '../../schemas';

export class FileModel {
  private readonly userId: string;
  private db: LobeChatDatabase;

  constructor(db: LobeChatDatabase, userId: string) {
    this.userId = userId;
    this.db = db;
  }

  create = async (params: Omit<NewFile, 'id' | 'userId'> & { knowledgeBaseId?: string }) => {
    const result = await this.db.transaction(async (trx) => {
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
    return this.db.insert(globalFiles).values(file).returning();
  };

  checkHash = async (hash: string) => {
    const item = await this.db.query.globalFiles.findFirst({
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

  delete = async (id: string, removeGlobalFile: boolean = true) => {
    const file = await this.findById(id);
    if (!file) return;

    const fileHash = file.fileHash!;

    return await this.db.transaction(async (trx) => {
      // 1. 删除相关的 chunks
      await this.deleteFileChunks(trx as any, [id]);

      // 2. 删除文件记录
      await trx.delete(files).where(and(eq(files.id, id), eq(files.userId, this.userId)));

      const result = await trx
        .select({ count: count() })
        .from(files)
        .where(and(eq(files.fileHash, fileHash)));

      const fileCount = result[0].count;

      // delete the file from global file if it is not used by other files
      // if `DISABLE_REMOVE_GLOBAL_FILE` is true, we will not remove the global file
      if (fileCount === 0 && removeGlobalFile) {
        await trx.delete(globalFiles).where(eq(globalFiles.hashId, fileHash));

        return file;
      }
    });
  };

  deleteGlobalFile = async (hashId: string) => {
    return this.db.delete(globalFiles).where(eq(globalFiles.hashId, hashId));
  };

  countUsage = async () => {
    const result = await this.db
      .select({
        totalSize: sum(files.size),
      })
      .from(files)
      .where(eq(files.userId, this.userId));

    return parseInt(result[0].totalSize!) || 0;
  };

  deleteMany = async (ids: string[], removeGlobalFile: boolean = true) => {
    const fileList = await this.findByIds(ids);
    const hashList = fileList.map((file) => file.fileHash!);

    return await this.db.transaction(async (trx) => {
      // 1. 删除相关的 chunks
      await this.deleteFileChunks(trx as any, ids);

      // delete the files
      await trx.delete(files).where(and(inArray(files.id, ids), eq(files.userId, this.userId)));

      // count the files by hash
      const result = await trx
        .select({
          count: count(),
          hashId: files.fileHash,
        })
        .from(files)
        .where(inArray(files.fileHash, hashList))
        .groupBy(files.fileHash);

      // Create a Map to store the query result
      const countMap = new Map(result.map((item) => [item.hashId, item.count]));

      // Ensure that all incoming hashes have a result, even if it is 0
      const fileHashCounts = hashList.map((hashId) => ({
        count: countMap.get(hashId) || 0,
        hashId: hashId,
      }));

      const needToDeleteList = fileHashCounts.filter((item) => item.count === 0);

      if (needToDeleteList.length === 0 || !removeGlobalFile) return;

      // delete the file from global file if it is not used by other files
      await trx.delete(globalFiles).where(
        inArray(
          globalFiles.hashId,
          needToDeleteList.map((item) => item.hashId!),
        ),
      );

      return fileList.filter((file) =>
        needToDeleteList.some((item) => item.hashId === file.fileHash),
      );
    });
  };

  clear = async () => {
    return this.db.delete(files).where(eq(files.userId, this.userId));
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
    let query = this.db
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
          this.db.select().from(knowledgeBaseFiles).where(eq(knowledgeBaseFiles.fileId, files.id)),
        ),
      );
    }

    // or we are just filter in the global files
    return query.where(whereClause).orderBy(orderByClause);
  };

  findByIds = async (ids: string[]) => {
    return this.db.query.files.findMany({
      where: and(inArray(files.id, ids), eq(files.userId, this.userId)),
    });
  };

  findById = async (id: string) => {
    return this.db.query.files.findFirst({
      where: and(eq(files.id, id), eq(files.userId, this.userId)),
    });
  };

  countFilesByHash = async (hash: string) => {
    const result = await this.db
      .select({
        count: count(),
      })
      .from(files)
      .where(and(eq(files.fileHash, hash)));

    return result[0].count;
  };

  async update(id: string, value: Partial<FileItem>) {
    return this.db
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

  async findByNames(fileNames: string[]) {
    return this.db.query.files.findMany({
      where: and(
        or(...fileNames.map((name) => like(files.name, `${name}%`))),
        eq(files.userId, this.userId),
      ),
    });
  }

  // 抽象出通用的删除 chunks 方法
  private async deleteFileChunks(trx: PgTransaction<any>, fileIds: string[]) {
    const BATCH_SIZE = 1000; // 每批处理的数量

    // 1. 获取所有关联的 chunk IDs
    const relatedChunks = await trx
      .select({ chunkId: fileChunks.chunkId })
      .from(fileChunks)
      .where(inArray(fileChunks.fileId, fileIds));

    const chunkIds = relatedChunks.map((c) => c.chunkId).filter(Boolean) as string[];

    if (chunkIds.length === 0) return;

    // 2. 分批处理删除
    for (let i = 0; i < chunkIds.length; i += BATCH_SIZE) {
      const batchChunkIds = chunkIds.slice(i, i + BATCH_SIZE);

      await trx.delete(embeddings).where(inArray(embeddings.chunkId, batchChunkIds));

      await trx.delete(chunks).where(inArray(chunks.id, batchChunkIds));
    }

    return chunkIds;
  }
}
