import { eq } from 'drizzle-orm';
import { beforeEach, describe, expect, it } from 'vitest';

import { clientDB, initializeDB } from '@/database/client/db';
import { files, globalFiles, users } from '@/database/schemas';
import { clientS3Storage } from '@/services/file/ClientS3';
import { UploadFileParams } from '@/types/files';

import { ClientService } from './client';

const userId = 'file-user';

const fileService = new ClientService(userId);

const mockFile = {
  name: 'mock.png',
  fileType: 'image/png',
  size: 1,
  url: '',
};

beforeEach(async () => {
  await initializeDB();

  await clientDB.delete(users);
  await clientDB.delete(globalFiles);
  // 创建测试数据
  await clientDB.transaction(async (tx) => {
    await tx.insert(users).values({ id: userId });
  });
});

describe('FileService', () => {
  describe('createFile', () => {
    it('createFile should save the file to the database', async () => {
      const localFile: UploadFileParams = {
        name: 'test',
        fileType: 'image/png',
        url: '',
        size: 1,
        hash: '123',
      };

      await clientS3Storage.putObject(
        '123',
        new File([new ArrayBuffer(1)], 'test.png', { type: 'image/png' }),
      );

      const result = await fileService.createFile(localFile);

      expect(result).toMatchObject({ url: 'data:image/png;base64,AA==' });
    });

    it('should throw error when file is not found in storage during base64 conversion', async () => {
      const localFile: UploadFileParams = {
        name: 'test',
        fileType: 'image/png',
        url: '',
        size: 1,
        hash: 'non-existing-hash',
      };

      // 不调用 clientS3Storage.putObject，模拟文件不存在的情况

      const promise = fileService.createFile(localFile);

      await expect(promise).rejects.toThrow('file not found');
    });
  });

  it('removeFile should delete the file from the database', async () => {
    const fileId = '1';
    await clientDB.insert(files).values({ id: fileId, userId, ...mockFile });

    await fileService.removeFile(fileId);

    const result = await clientDB.query.files.findFirst({
      where: eq(files.id, fileId),
    });

    expect(result).toBeUndefined();
  });

  describe('getFile', () => {
    it('should retrieve and convert local file info to FilePreview', async () => {
      const fileId = 'rwlijweled';
      const file = {
        fileType: 'image/png',
        size: 1,
        name: 'test.png',
        url: 'idb://12312/abc.png',
        hashId: '123tttt',
      };

      await clientDB.insert(globalFiles).values(file);

      await clientDB.insert(files).values({
        id: fileId,
        userId,
        ...file,
        createdAt: new Date(1),
        updatedAt: new Date(2),
        fileHash: file.hashId,
      });

      await clientS3Storage.putObject(
        file.hashId,
        new File([new ArrayBuffer(1)], file.name, { type: file.fileType }),
      );

      const result = await fileService.getFile(fileId);

      expect(result).toMatchObject({
        createdAt: new Date(1),
        id: 'rwlijweled',
        size: 1,
        type: 'image/png',
        name: 'test.png',
        updatedAt: new Date(2),
      });
    });

    it('should throw an error when the file is not found', async () => {
      const fileId = 'non-existent';

      const getFilePromise = fileService.getFile(fileId);

      await expect(getFilePromise).rejects.toThrow('file not found');
    });
  });

  describe('removeFiles', () => {
    it('should delete multiple files from the database', async () => {
      const fileIds = ['1', '2', '3'];

      // 插入测试文件数据
      await Promise.all(
        fileIds.map((id) => clientDB.insert(files).values({ id, userId, ...mockFile })),
      );

      await fileService.removeFiles(fileIds);

      // 验证所有文件都被删除
      const remainingFiles = await clientDB.query.files.findMany({
        where: (fields, { inArray }) => inArray(fields.id, fileIds),
      });

      expect(remainingFiles).toHaveLength(0);
    });
  });

  describe('removeAllFiles', () => {
    it('should clear all files for the user', async () => {
      // 插入测试文件数据
      await Promise.all([
        clientDB.insert(files).values({ id: '1', userId, ...mockFile }),
        clientDB.insert(files).values({ id: '2', userId, ...mockFile }),
      ]);

      await fileService.removeAllFiles();

      // 验证用户的所有文件都被删除
      const remainingFiles = await clientDB.query.files.findMany({
        where: eq(files.userId, userId),
      });

      expect(remainingFiles).toHaveLength(0);
    });
  });

  describe('checkFileHash', () => {
    it('should return true if file hash exists', async () => {
      const hash = 'existing-hash';
      await clientDB.insert(globalFiles).values({
        ...mockFile,
        hashId: hash,
      });
      await clientDB.insert(files).values({
        id: '1',
        userId,
        ...mockFile,
        fileHash: hash,
      });

      const exists = await fileService.checkFileHash(hash);

      expect(exists).toMatchObject({ isExist: true });
    });

    it('should return false if file hash does not exist', async () => {
      const hash = 'non-existing-hash';

      const exists = await fileService.checkFileHash(hash);

      expect(exists).toEqual({ isExist: false });
    });
  });
});
