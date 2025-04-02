import { count, sum } from 'drizzle-orm';
import { and, asc, desc, eq, ilike, inArray, like, notExists, or } from 'drizzle-orm/expressions';
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
} from '../schemas';

export class FileModel {
  private readonly userId: string;
  private db: LobeChatDatabase;

  constructor(db: LobeChatDatabase, userId: string) {
    this.userId = userId;
    this.db = db;
  }

  create = async (
    params: Omit<NewFile, 'id' | 'userId'> & { knowledgeBaseId?: string },
    insertToGlobalFiles?: boolean,
  ) => {
    const result = await this.db.transaction(async (trx) => {
      if (insertToGlobalFiles) {
        await trx.insert(globalFiles).values({
          creator: this.userId,
          fileType: params.fileType,
          hashId: params.fileHash!,
          metadata: params.metadata,
          size: params.size,
          url: params.url,
        });
      }

      const result = await trx
        .insert(files)
        .values({ ...params, userId: this.userId })
        .returning();

      const item = result[0];

      if (params.knowledgeBaseId) {
        await trx.insert(knowledgeBaseFiles).values({
          fileId: item.id,
          knowledgeBaseId: params.knowledgeBaseId,
          userId: this.userId,
        });
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
    if (ids.length === 0) return [];

    return await this.db.transaction(async (trx) => {
      // 1. 先获取文件列表，以便返回删除的文件
      const fileList = await trx.query.files.findMany({
        where: and(inArray(files.id, ids), eq(files.userId, this.userId)),
      });

      if (fileList.length === 0) return [];

      // 提取需要检查的文件哈希值
      const hashList = fileList.map((file) => file.fileHash!).filter(Boolean);

      // 2. 删除相关的 chunks
      await this.deleteFileChunks(trx as any, ids);

      // 3. 删除文件记录
      await trx.delete(files).where(and(inArray(files.id, ids), eq(files.userId, this.userId)));

      // 如果不需要删除全局文件，直接返回
      if (!removeGlobalFile || hashList.length === 0) return fileList;

      // 4. 找出不再被引用的哈希值
      const remainingFiles = await trx
        .select({
          fileHash: files.fileHash,
        })
        .from(files)
        .where(inArray(files.fileHash, hashList));

      // 将仍在使用的哈希值放入Set中，便于快速查找
      const usedHashes = new Set(remainingFiles.map((file) => file.fileHash));

      // 找出需要删除的哈希值(不再被任何文件使用的)
      const hashesToDelete = hashList.filter((hash) => !usedHashes.has(hash));

      if (hashesToDelete.length === 0) return fileList;

      // 5. 删除不再被引用的全局文件
      await trx.delete(globalFiles).where(inArray(globalFiles.hashId, hashesToDelete));

      // 返回删除的文件列表
      return fileList;
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

  update = async (id: string, value: Partial<FileItem>) =>
    this.db
      .update(files)
      .set({ ...value, updatedAt: new Date() })
      .where(and(eq(files.id, id), eq(files.userId, this.userId)));

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

  findByNames = async (fileNames: string[]) =>
    this.db.query.files.findMany({
      where: and(
        or(...fileNames.map((name) => like(files.name, `${name}%`))),
        eq(files.userId, this.userId),
      ),
    });

  // 抽象出通用的删除 chunks 方法
  private deleteFileChunks = async (trx: PgTransaction<any>, fileIds: string[]) => {
    if (fileIds.length === 0) return;

    // 直接使用 JOIN 优化查询，减少数据传输量
    const relatedChunks = await trx
      .select({ chunkId: fileChunks.chunkId })
      .from(fileChunks)
      .where(
        and(
          inArray(fileChunks.fileId, fileIds),
          // 确保只查询有效的 chunkId
          notExists(
            trx
              .select()
              .from(knowledgeBaseFiles)
              .where(eq(knowledgeBaseFiles.fileId, fileChunks.fileId)),
          ),
        ),
      );

    const chunkIds = relatedChunks.map((c) => c.chunkId).filter(Boolean) as string[];

    if (chunkIds.length === 0) return;

    // 批量处理配置
    const BATCH_SIZE = 1000; // 增加批处理量
    const MAX_CONCURRENT_BATCHES = 3; // 最大并行批次数

    // 分批并行处理
    for (let i = 0; i < chunkIds.length; i += BATCH_SIZE * MAX_CONCURRENT_BATCHES) {
      const batchPromises = [];

      // 创建多个并行批次
      for (let j = 0; j < MAX_CONCURRENT_BATCHES; j++) {
        const startIdx = i + j * BATCH_SIZE;
        if (startIdx >= chunkIds.length) break;

        const batchChunkIds = chunkIds.slice(startIdx, startIdx + BATCH_SIZE);
        if (batchChunkIds.length === 0) continue;

        // 为每个批次创建一个删除任务
        const batchPromise = (async () => {
          // 先删除嵌入向量
          await trx.delete(embeddings).where(inArray(embeddings.chunkId, batchChunkIds));
          // 再删除块
          await trx.delete(chunks).where(inArray(chunks.id, batchChunkIds));
        })();

        batchPromises.push(batchPromise);
      }

      // 等待当前批次的所有任务完成
      await Promise.all(batchPromises);
    }

    return chunkIds;
  };
}
