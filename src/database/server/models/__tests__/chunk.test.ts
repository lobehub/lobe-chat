// @vitest-environment node
import { eq } from 'drizzle-orm';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getTestDBInstance } from '@/database/server/core/dbForTest';

import {
  chunks,
  embeddings,
  fileChunks,
  files,
  unstructuredChunks,
  users,
} from '../../schemas/lobechat';
import { ChunkModel } from '../chunk';
import { codeEmbedding, designThinkingQuery, designThinkingQuery2 } from './fixtures/embedding';

let serverDB = await getTestDBInstance();

vi.mock('@/database/server/core/db', async () => ({
  get serverDB() {
    return serverDB;
  },
}));

const userId = 'chunk-model-test-user-id';
const chunkModel = new ChunkModel(userId);
const sharedFileList = [
  {
    id: '1',
    name: 'document.pdf',
    url: 'https://example.com/document.pdf',
    size: 1000,
    fileType: 'application/pdf',
    userId,
  },
  {
    id: '2',
    name: 'image.jpg',
    url: 'https://example.com/image.jpg',
    size: 500,
    fileType: 'image/jpeg',
    userId,
  },
  {
    id: '3',
    name: 'audio.mp3',
    url: 'https://example.com/audio.mp3',
    size: 2000,
    fileType: 'audio/mpeg',
    userId,
  },
];

beforeEach(async () => {
  await serverDB.delete(users);
  await serverDB.insert(users).values([{ id: userId }]);
  await serverDB.insert(files).values(sharedFileList);
});

afterEach(async () => {
  await serverDB.delete(users).where(eq(users.id, userId));
});

describe('ChunkModel', () => {
  describe('bulkCreate', () => {
    it('should create multiple chunks', async () => {
      const params = [
        { text: 'Chunk 1', userId },
        { text: 'Chunk 2', userId },
      ];

      await chunkModel.bulkCreate(params, '1');

      const createdChunks = await serverDB.query.chunks.findMany({
        where: eq(chunks.userId, userId),
      });
      expect(createdChunks).toHaveLength(2);
      expect(createdChunks[0]).toMatchObject(params[0]);
      expect(createdChunks[1]).toMatchObject(params[1]);
    });
  });

  describe('delete', () => {
    it('should delete a chunk by id', async () => {
      const { id } = await serverDB
        .insert(chunks)
        .values({ text: 'Test Chunk', userId })
        .returning()
        .then((res) => res[0]);

      await chunkModel.delete(id);

      const chunk = await serverDB.query.chunks.findFirst({
        where: eq(chunks.id, id),
      });
      expect(chunk).toBeUndefined();
    });
  });

  // Add more test cases for other methods...

  describe('semanticSearch', () => {
    it('should perform semantic search and return results', async () => {
      const fileId = '1';
      const [chunk1, chunk2] = await serverDB
        .insert(chunks)
        .values([
          { text: 'Test Chunk 1', userId },
          { text: 'Test Chunk 2', userId },
        ])
        .returning();

      await serverDB.insert(fileChunks).values([
        { fileId, chunkId: chunk1.id },
        { fileId, chunkId: chunk2.id },
      ]);

      await serverDB.insert(embeddings).values([
        { chunkId: chunk1.id, embeddings: designThinkingQuery, userId },
        { chunkId: chunk2.id, embeddings: codeEmbedding, userId },
      ]);

      const result = await chunkModel.semanticSearch({
        embedding: designThinkingQuery2,
        fileIds: [fileId],
        query: 'design thinking',
      });

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(chunk1.id);
      expect(result[1].id).toBe(chunk2.id);
      expect(result[0].similarity).toBeGreaterThan(result[1].similarity);
    });
  });

  describe('bulkCreateUnstructuredChunks', () => {
    it('should create multiple unstructured chunks', async () => {
      const [chunk] = await serverDB
        .insert(chunks)
        .values([{ text: 'Chunk 1', userId, index: 0 }])
        .returning();

      const params = [
        { text: 'Unstructured Chunk 1', userId, fileId: '1', parentId: '1', compositeId: chunk.id },
        { text: 'Unstructured Chunk 2', userId, fileId: '1', parentId: '1', compositeId: chunk.id },
      ];

      await chunkModel.bulkCreateUnstructuredChunks(params);

      const createdChunks = await serverDB.query.unstructuredChunks.findMany({
        where: eq(unstructuredChunks.userId, userId),
      });
      expect(createdChunks).toHaveLength(2);
      expect(createdChunks[0]).toMatchObject(params[0]);
      expect(createdChunks[1]).toMatchObject(params[1]);
    });
  });

  describe('findByFileId', () => {
    it('should find chunks by file id with pagination', async () => {
      const fileId = '1';
      const [chunk1, chunk2, chunk3] = await serverDB
        .insert(chunks)
        .values([
          { text: 'Chunk 1', userId, index: 0 },
          { text: 'Chunk 2', userId, index: 1 },
          { text: 'Chunk 3', userId, index: 2 },
        ])
        .returning();

      await serverDB.insert(fileChunks).values([
        { fileId, chunkId: chunk1.id },
        { fileId, chunkId: chunk2.id },
        { fileId, chunkId: chunk3.id },
      ]);

      const result = await chunkModel.findByFileId(fileId, 0);

      expect(result).toHaveLength(3);
      expect(result[0].index).toBe(0);
      expect(result[1].index).toBe(1);
      expect(result[2].index).toBe(2);
    });
  });

  describe('getChunksTextByFileId', () => {
    it('should get chunks text by file id', async () => {
      const fileId = '1';
      const [chunk1, chunk2] = await serverDB
        .insert(chunks)
        .values([
          { text: 'Chunk 1', userId },
          { text: 'Chunk 2', userId },
        ])
        .returning();

      await serverDB.insert(fileChunks).values([
        { fileId, chunkId: chunk1.id },
        { fileId, chunkId: chunk2.id },
      ]);

      const result = await chunkModel.getChunksTextByFileId(fileId);

      expect(result).toHaveLength(2);
      expect(result[0].text).toBe('Chunk 1');
      expect(result[1].text).toBe('Chunk 2');
    });
  });

  describe('countByFileIds', () => {
    it('should count chunks by file ids', async () => {
      const fileIds = ['1', '2'];
      const [chunk1, chunk2, chunk3] = await serverDB
        .insert(chunks)
        .values([
          { text: 'Chunk 1', userId, index: 0 },
          { text: 'Chunk 2', userId, index: 1 },
          { text: 'Chunk 3', userId, index: 2 },
        ])
        .returning();

      await serverDB.insert(fileChunks).values([
        { fileId: '1', chunkId: chunk1.id },
        { fileId: '1', chunkId: chunk2.id },
        { fileId: '2', chunkId: chunk3.id },
      ]);

      const result = await chunkModel.countByFileIds(fileIds);

      expect(result).toHaveLength(2);
      expect(result.find((r) => r.id === '1')?.count).toBe(2);
      expect(result.find((r) => r.id === '2')?.count).toBe(1);
    });

    it('should return empty array for empty file ids', async () => {
      const result = await chunkModel.countByFileIds([]);

      expect(result).toHaveLength(0);
    });
  });

  describe('countByFileId', () => {
    it('should count chunks by file id', async () => {
      const fileId = '1';
      const [chunk1, chunk2, chunk3] = await serverDB
        .insert(chunks)
        .values([
          { text: 'Chunk 1', userId, index: 0 },
          { text: 'Chunk 2', userId, index: 1 },
        ])
        .returning();

      await serverDB.insert(fileChunks).values([
        { fileId, chunkId: chunk1.id },
        { fileId, chunkId: chunk2.id },
      ]);

      const result = await chunkModel.countByFileId(fileId);

      expect(result).toBe(2);
    });

    it('should return 0 for non-existent file id', async () => {
      const result = await chunkModel.countByFileId('non-existent');

      expect(result).toBe(0);
    });
  });

  describe('semanticSearchForChat', () => {
    it('should perform semantic search for chat and return results', async () => {
      const fileId = '1';
      const [chunk1, chunk2] = await serverDB
        .insert(chunks)
        .values([
          { text: 'Test Chunk 1', userId },
          { text: 'Test Chunk 2', userId },
        ])
        .returning();

      await serverDB.insert(fileChunks).values([
        { fileId, chunkId: chunk1.id },
        { fileId, chunkId: chunk2.id },
      ]);

      await serverDB.insert(embeddings).values([
        { chunkId: chunk1.id, embeddings: designThinkingQuery, userId },
        { chunkId: chunk2.id, embeddings: codeEmbedding, userId },
      ]);

      const result = await chunkModel.semanticSearchForChat({
        embedding: designThinkingQuery2,
        fileIds: [fileId],
        query: 'design thinking',
      });

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(chunk1.id);
      expect(result[1].id).toBe(chunk2.id);
      expect(result[0].similarity).toBeGreaterThan(result[1].similarity);
    });
  });

  describe('mapChunkText', () => {
    it('should map chunk text correctly for non-Table type', () => {
      const chunk = {
        text: 'Normal text',
        type: 'Text',
        metadata: {},
      };

      const result = chunkModel['mapChunkText'](chunk);

      expect(result).toBe('Normal text');
    });

    it('should map chunk text correctly for Table type', () => {
      const chunk = {
        text: 'Table text',
        type: 'Table',
        metadata: {
          text_as_html: '<table>...</table>',
        },
      };

      const result = chunkModel['mapChunkText'](chunk);

      expect(result).toBe(`Table text

content in Table html is below:
<table>...</table>
`);
    });
  });
});
