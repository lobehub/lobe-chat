// @vitest-environment node
import { eq } from 'drizzle-orm';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getTestDBInstance } from '@/database/server/core/dbForTest';
import { FilesTabs, SortType } from '@/types/files';

import {
  files,
  globalFiles,
  knowledgeBaseFiles,
  knowledgeBases,
  users,
} from '../../schemas/lobechat';
import { FileModel } from '../file';

let serverDB = await getTestDBInstance();

vi.mock('@/database/server/core/db', async () => ({
  get serverDB() {
    return serverDB;
  },
}));

const userId = 'file-model-test-user-id';
const fileModel = new FileModel(userId);

const knowledgeBase = { id: 'kb1', userId, name: 'knowledgeBase' };
beforeEach(async () => {
  await serverDB.delete(users);
  await serverDB.insert(users).values([{ id: userId }, { id: 'user2' }]);
  await serverDB.insert(knowledgeBases).values(knowledgeBase);
});

afterEach(async () => {
  await serverDB.delete(users);
  await serverDB.delete(files);
  await serverDB.delete(globalFiles);
});

describe('FileModel', () => {
  describe('create', () => {
    it('should create a new file', async () => {
      const params = {
        name: 'test-file.txt',
        url: 'https://example.com/test-file.txt',
        size: 100,
        fileType: 'text/plain',
      };

      const { id } = await fileModel.create(params);
      expect(id).toBeDefined();

      const file = await serverDB.query.files.findFirst({ where: eq(files.id, id) });
      expect(file).toMatchObject({ ...params, userId });
    });

    it('should create a file with knowledgeBaseId', async () => {
      const params = {
        name: 'test-file.txt',
        url: 'https://example.com/test-file.txt',
        size: 100,
        fileType: 'text/plain',
        knowledgeBaseId: 'kb1',
      };

      const { id } = await fileModel.create(params);

      const kbFile = await serverDB.query.knowledgeBaseFiles.findFirst({
        where: eq(knowledgeBaseFiles.fileId, id),
      });
      expect(kbFile).toMatchObject({ fileId: id, knowledgeBaseId: 'kb1' });
    });
  });

  it('should create a global file', async () => {
    const globalFile = {
      hashId: 'test-hash',
      fileType: 'text/plain',
      size: 100,
      url: 'https://example.com/global-file.txt',
      metadata: { key: 'value' },
    };

    const result = await fileModel.createGlobalFile(globalFile);
    expect(result[0]).toMatchObject(globalFile);
  });
  describe('checkHash', () => {
    it('should return isExist: false for non-existent hash', async () => {
      const result = await fileModel.checkHash('non-existent-hash');
      expect(result).toEqual({ isExist: false });
    });

    it('should return file info for existing hash', async () => {
      const globalFile = {
        hashId: 'existing-hash',
        fileType: 'text/plain',
        size: 100,
        url: 'https://example.com/existing-file.txt',
        metadata: { key: 'value' },
      };

      await serverDB.insert(globalFiles).values(globalFile);

      const result = await fileModel.checkHash('existing-hash');
      expect(result).toEqual({
        isExist: true,
        fileType: 'text/plain',
        size: 100,
        url: 'https://example.com/existing-file.txt',
        metadata: { key: 'value' },
      });
    });
  });

  it('should delete a file by id', async () => {
    const { id } = await fileModel.create({
      name: 'test-file.txt',
      url: 'https://example.com/test-file.txt',
      size: 100,
      fileType: 'text/plain',
    });

    await fileModel.delete(id);

    const file = await serverDB.query.files.findFirst({ where: eq(files.id, id) });
    expect(file).toBeUndefined();
  });

  it('should delete multiple files', async () => {
    const file1 = await fileModel.create({
      name: 'file1.txt',
      url: 'https://example.com/file1.txt',
      size: 100,
      fileType: 'text/plain',
    });
    const file2 = await fileModel.create({
      name: 'file2.txt',
      url: 'https://example.com/file2.txt',
      size: 200,
      fileType: 'text/plain',
    });

    await fileModel.deleteMany([file1.id, file2.id]);

    const remainingFiles = await serverDB.query.files.findMany({ where: eq(files.userId, userId) });
    expect(remainingFiles).toHaveLength(0);
  });

  it('should clear all files for the user', async () => {
    await fileModel.create({
      name: 'test-file-1.txt',
      url: 'https://example.com/test-file-1.txt',
      size: 100,
      fileType: 'text/plain',
    });
    await fileModel.create({
      name: 'test-file-2.txt',
      url: 'https://example.com/test-file-2.txt',
      size: 200,
      fileType: 'text/plain',
    });

    await fileModel.clear();

    const userFiles = await serverDB.query.files.findMany({ where: eq(files.userId, userId) });
    expect(userFiles).toHaveLength(0);
  });

  describe('Query', () => {
    const sharedFileList = [
      {
        name: 'document.pdf',
        url: 'https://example.com/document.pdf',
        size: 1000,
        fileType: 'application/pdf',
        userId,
      },
      {
        name: 'image.jpg',
        url: 'https://example.com/image.jpg',
        size: 500,
        fileType: 'image/jpeg',
        userId,
      },
      {
        name: 'audio.mp3',
        url: 'https://example.com/audio.mp3',
        size: 2000,
        fileType: 'audio/mpeg',
        userId,
      },
    ];

    it('should query files for the user', async () => {
      await fileModel.create({
        name: 'test-file-1.txt',
        url: 'https://example.com/test-file-1.txt',
        size: 100,
        fileType: 'text/plain',
      });
      await fileModel.create({
        name: 'test-file-2.txt',
        url: 'https://example.com/test-file-2.txt',
        size: 200,
        fileType: 'text/plain',
      });
      await serverDB.insert(files).values({
        name: 'audio.mp3',
        url: 'https://example.com/audio.mp3',
        size: 2000,
        fileType: 'audio/mpeg',
        userId: 'user2',
      });

      const userFiles = await fileModel.query();
      expect(userFiles).toHaveLength(2);
      expect(userFiles[0].name).toBe('test-file-2.txt');
      expect(userFiles[1].name).toBe('test-file-1.txt');
    });

    it('should filter files by name', async () => {
      await serverDB.insert(files).values(sharedFileList);
      const filteredFiles = await fileModel.query({ q: 'DOC' });
      expect(filteredFiles).toHaveLength(1);
      expect(filteredFiles[0].name).toBe('document.pdf');
    });

    it('should filter files by category', async () => {
      await serverDB.insert(files).values(sharedFileList);

      const imageFiles = await fileModel.query({ category: FilesTabs.Images });
      expect(imageFiles).toHaveLength(1);
      expect(imageFiles[0].name).toBe('image.jpg');
    });

    it('should sort files by name in ascending order', async () => {
      await serverDB.insert(files).values(sharedFileList);

      const sortedFiles = await fileModel.query({ sortType: SortType.Asc, sorter: 'name' });
      expect(sortedFiles[0].name).toBe('audio.mp3');
      expect(sortedFiles[2].name).toBe('image.jpg');
    });

    it('should sort files by size in descending order', async () => {
      await serverDB.insert(files).values(sharedFileList);

      const sortedFiles = await fileModel.query({ sortType: SortType.Desc, sorter: 'size' });
      expect(sortedFiles[0].name).toBe('audio.mp3');
      expect(sortedFiles[2].name).toBe('image.jpg');
    });

    it('should combine filtering and sorting', async () => {
      await serverDB.insert(files).values([
        ...sharedFileList,
        {
          name: 'big_document.pdf',
          url: 'https://example.com/big_document.pdf',
          size: 5000,
          fileType: 'application/pdf',
          userId,
        },
      ]);

      const filteredAndSortedFiles = await fileModel.query({
        category: FilesTabs.Documents,
        sortType: SortType.Desc,
        sorter: 'size',
      });

      expect(filteredAndSortedFiles).toHaveLength(2);
      expect(filteredAndSortedFiles[0].name).toBe('big_document.pdf');
      expect(filteredAndSortedFiles[1].name).toBe('document.pdf');
    });

    it('should return an empty array when no files match the query', async () => {
      await serverDB.insert(files).values(sharedFileList);
      const noFiles = await fileModel.query({ q: 'nonexistent' });
      expect(noFiles).toHaveLength(0);
    });

    it('should handle invalid sort field gracefully', async () => {
      await serverDB.insert(files).values(sharedFileList);

      const result = await fileModel.query({
        sortType: SortType.Asc,
        sorter: 'invalidField' as any,
      });
      expect(result).toHaveLength(3);
      // Should default to sorting by createdAt in descending order
    });

    describe('Query with knowledge base', () => {
      beforeEach(async () => {
        await serverDB.insert(files).values([
          {
            id: 'file1',
            name: 'file1.txt',
            userId,
            fileType: 'text/plain',
            size: 100,
            url: 'url1',
          },
          {
            id: 'file2',
            name: 'file2.txt',
            userId,
            fileType: 'text/plain',
            size: 200,
            url: 'url2',
          },
        ]);
        await serverDB
          .insert(knowledgeBaseFiles)
          .values([{ fileId: 'file1', knowledgeBaseId: 'kb1' }]);
      });

      it('should query files in a specific knowledge base', async () => {
        const result = await fileModel.query({ knowledgeBaseId: 'kb1' });
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe('file1');
      });

      it('should exclude files in knowledge bases when showFilesInKnowledgeBase is false', async () => {
        const result = await fileModel.query({ showFilesInKnowledgeBase: false });
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe('file2');
      });

      it('should include all files when showFilesInKnowledgeBase is true', async () => {
        const result = await fileModel.query({ showFilesInKnowledgeBase: true });
        expect(result).toHaveLength(2);
      });
    });
  });

  it('should find a file by id', async () => {
    const { id } = await fileModel.create({
      name: 'test-file.txt',
      url: 'https://example.com/test-file.txt',
      size: 100,
      fileType: 'text/plain',
    });

    const file = await fileModel.findById(id);
    expect(file).toMatchObject({
      id,
      name: 'test-file.txt',
      url: 'https://example.com/test-file.txt',
      size: 100,
      fileType: 'text/plain',
      userId,
    });
  });

  it('should update a file', async () => {
    const { id } = await fileModel.create({
      name: 'test-file.txt',
      url: 'https://example.com/test-file.txt',
      size: 100,
      fileType: 'text/plain',
    });

    await fileModel.update(id, { name: 'updated-test-file.txt', size: 200 });

    const updatedFile = await serverDB.query.files.findFirst({ where: eq(files.id, id) });
    expect(updatedFile).toMatchObject({
      id,
      name: 'updated-test-file.txt',
      url: 'https://example.com/test-file.txt',
      size: 200,
      fileType: 'text/plain',
      userId,
    });
  });

  it('should countFilesByHash', async () => {
    const fileList = [
      {
        id: '1',
        name: 'document.pdf',
        url: 'https://example.com/document.pdf',
        fileHash: 'hash1',
        size: 1000,
        fileType: 'application/pdf',
        userId,
      },
      {
        id: '2',
        name: 'image.jpg',
        url: 'https://example.com/image.jpg',
        fileHash: 'hash2',
        size: 500,
        fileType: 'image/jpeg',
        userId,
      },
      {
        id: '5',
        name: 'document.pdf',
        url: 'https://example.com/document.pdf',
        fileHash: 'hash1',
        size: 1000,
        fileType: 'application/pdf',
        userId: 'user2',
      },
    ];

    await serverDB.insert(globalFiles).values([
      {
        hashId: 'hash1',
        url: 'https://example.com/document.pdf',
        size: 1000,
        fileType: 'application/pdf',
      },
      {
        hashId: 'hash2',
        url: 'https://example.com/image.jpg',
        size: 500,
        fileType: 'image/jpeg',
      },
    ]);

    await serverDB.insert(files).values(fileList);

    const data = await fileModel.countFilesByHash('hash1');
    expect(data).toEqual(2);
  });
});
