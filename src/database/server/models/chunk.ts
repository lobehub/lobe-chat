import { asc, cosineDistance, count, eq, inArray, sql } from 'drizzle-orm';
import { and, desc, isNull } from 'drizzle-orm/expressions';

import { serverDB } from '@/database/server';
import { ChunkMetadata, FileChunk, SemanticSearchChunk } from '@/types/chunk';

import {
  NewChunkItem,
  NewUnstructuredChunkItem,
  chunks,
  embeddings,
  fileChunks,
  files,
  unstructuredChunks,
} from '../schemas/lobechat';

export class ChunkModel {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  bulkCreate = async (params: NewChunkItem[], fileId: string) => {
    return serverDB.transaction(async (trx) => {
      const result = await trx.insert(chunks).values(params).returning();

      const fileChunksData = result.map((chunk) => ({ chunkId: chunk.id, fileId }));

      if (fileChunksData.length > 0) {
        await trx.insert(fileChunks).values(fileChunksData);
      }

      return result;
    });
  };

  bulkCreateUnstructuredChunks = async (params: NewUnstructuredChunkItem[]) => {
    return serverDB.insert(unstructuredChunks).values(params);
  };

  delete = async (id: string) => {
    return serverDB.delete(chunks).where(and(eq(chunks.id, id), eq(chunks.userId, this.userId)));
  };

  deleteOrphanChunks = async () => {
    const orphanedChunks = await serverDB
      .select({ chunkId: chunks.id })
      .from(chunks)
      .leftJoin(fileChunks, eq(chunks.id, fileChunks.chunkId))
      .where(isNull(fileChunks.fileId));

    const ids = orphanedChunks.map((chunk) => chunk.chunkId);
    if (ids.length === 0) return;

    await serverDB.delete(chunks).where(inArray(chunks.id, ids));
  };

  findById = async (id: string) => {
    return serverDB.query.chunks.findFirst({
      where: and(eq(chunks.id, id)),
    });
  };

  async findByFileId(id: string, page = 0) {
    const data = await serverDB
      .select({
        abstract: chunks.abstract,
        createdAt: chunks.createdAt,
        id: chunks.id,
        index: chunks.index,
        metadata: chunks.metadata,
        text: chunks.text,
        type: chunks.type,
        updatedAt: chunks.updatedAt,
      })
      .from(chunks)
      .innerJoin(fileChunks, eq(chunks.id, fileChunks.chunkId))
      .where(and(eq(fileChunks.fileId, id), eq(chunks.userId, this.userId)))
      .limit(20)
      .offset(page * 20)
      .orderBy(asc(chunks.index));

    return data.map((item) => {
      const metadata = item.metadata as ChunkMetadata;

      return { ...item, metadata, pageNumber: metadata?.pageNumber } as FileChunk;
    });
  }

  async getChunksTextByFileId(id: string): Promise<{ id: string; text: string }[]> {
    const data = await serverDB
      .select()
      .from(chunks)
      .innerJoin(fileChunks, eq(chunks.id, fileChunks.chunkId))
      .where(eq(fileChunks.fileId, id));

    return data
      .map((item) => item.chunks)
      .map((chunk) => ({ id: chunk.id, text: this.mapChunkText(chunk) }))
      .filter((chunk) => chunk.text) as { id: string; text: string }[];
  }

  async countByFileIds(ids: string[]) {
    if (ids.length === 0) return [];

    return serverDB
      .select({
        count: count(fileChunks.chunkId),
        id: fileChunks.fileId,
      })
      .from(fileChunks)
      .where(inArray(fileChunks.fileId, ids))
      .groupBy(fileChunks.fileId);
  }

  async countByFileId(ids: string) {
    const data = await serverDB
      .select({
        count: count(fileChunks.chunkId),
        id: fileChunks.fileId,
      })
      .from(fileChunks)
      .where(eq(fileChunks.fileId, ids))
      .groupBy(fileChunks.fileId);

    return data[0]?.count ?? 0;
  }

  async semanticSearch({
    embedding,
    fileIds,
  }: {
    embedding: number[];
    fileIds: string[] | undefined;
    query: string;
  }) {
    const similarity = sql<number>`1 - (${cosineDistance(embeddings.embeddings, embedding)})`;

    const data = await serverDB
      .select({
        id: chunks.id,
        index: chunks.index,
        metadata: chunks.metadata,
        similarity,
        text: chunks.text,
        type: chunks.type,
      })
      .from(chunks)
      .leftJoin(embeddings, eq(chunks.id, embeddings.chunkId))
      .leftJoin(fileChunks, eq(chunks.id, fileChunks.chunkId))
      .where(fileIds ? inArray(fileChunks.fileId, fileIds) : undefined)
      .orderBy((t) => desc(t.similarity))
      .limit(30);

    return data.map(
      (item): SemanticSearchChunk => ({
        ...item,
        metadata: item.metadata as ChunkMetadata,
      }),
    );
  }

  async semanticSearchForChat({
    embedding,
    fileIds,
  }: {
    embedding: number[];
    fileIds: string[] | undefined;
    query: string;
  }) {
    const similarity = sql<number>`1 - (${cosineDistance(embeddings.embeddings, embedding)})`;

    const result = await serverDB
      .select({
        fileId: files.id,
        filename: files.name,
        id: chunks.id,
        index: chunks.index,
        metadata: chunks.metadata,
        similarity,
        text: chunks.text,
        type: chunks.type,
      })
      .from(chunks)
      .leftJoin(embeddings, eq(chunks.id, embeddings.chunkId))
      .leftJoin(fileChunks, eq(chunks.id, fileChunks.chunkId))
      .leftJoin(files, eq(files.id, fileChunks.fileId))
      .where(and(fileIds && fileIds.length > 0 ? inArray(fileChunks.fileId, fileIds) : undefined))
      .orderBy((t) => desc(t.similarity))
      .limit(5);

    return result.map((item) => {
      return {
        id: item.id,
        index: item.index,
        similarity: item.similarity,
        text: this.mapChunkText(item),
      };
    });
  }

  private mapChunkText = (chunk: { metadata: any; text: string | null; type: string | null }) => {
    let text = chunk.text;

    if (chunk.type === 'Table') {
      text = `${chunk.text}

content in Table html is below:
${(chunk.metadata as ChunkMetadata).text_as_html}
`;
    }

    return text;
  };
}
