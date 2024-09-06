import { Mock, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { fileEnv } from '@/config/file';
import { FileModel } from '@/database/client/models/file';
import { DB_File } from '@/database/client/schemas/files';
import { serverConfigSelectors } from '@/store/serverConfig/selectors';
import { createServerConfigStore } from '@/store/serverConfig/store';

import { ClientService } from './client';

const fileService = new ClientService();

beforeAll(() => {
  createServerConfigStore();
});
// Mocks for the FileModel
vi.mock('@/database/client/models/file', () => ({
  FileModel: {
    create: vi.fn(),
    delete: vi.fn(),
    findById: vi.fn(),
    clear: vi.fn(),
  },
}));

let s3Domain: string;

vi.mock('@/config/file', () => ({
  fileEnv: {
    get NEXT_PUBLIC_S3_DOMAIN() {
      return s3Domain;
    },
  },
}));

// Mocks for the URL and Blob objects
global.URL.createObjectURL = vi.fn();
global.Blob = vi.fn();

beforeEach(() => {
  // Reset all mocks before each test
  vi.resetAllMocks();
  s3Domain = '';
});

describe('FileService', () => {
  it('createFile should save the file to the database', async () => {
    const localFile: DB_File = {
      name: 'test',
      data: new ArrayBuffer(1),
      fileType: 'image/png',
      saveMode: 'local',
      size: 1,
    };

    (FileModel.create as Mock).mockResolvedValue(localFile);

    const result = await fileService.createFile(localFile);

    expect(FileModel.create).toHaveBeenCalledWith(localFile);
    expect(result).toEqual({ url: 'data:image/png;base64,AA==' });
  });

  it('removeFile should delete the file from the database', async () => {
    const fileId = '1';
    (FileModel.delete as Mock).mockResolvedValue(true);

    const result = await fileService.removeFile(fileId);

    expect(FileModel.delete).toHaveBeenCalledWith(fileId);
    expect(result).toBe(true);
  });

  describe('getFile', () => {
    it('should retrieve and convert local file info to FilePreview', async () => {
      const fileId = '1';
      const fileData = {
        name: 'test',
        data: new ArrayBuffer(1),
        fileType: 'image/png',
        saveMode: 'local',
        size: 1,
        createdAt: 1,
        updatedAt: 2,
      } as DB_File;

      (FileModel.findById as Mock).mockResolvedValue(fileData);
      (global.URL.createObjectURL as Mock).mockReturnValue('blob:test');
      (global.Blob as Mock).mockImplementation(() => ['test']);

      const result = await fileService.getFile(fileId);

      expect(FileModel.findById).toHaveBeenCalledWith(fileId);
      expect(result).toEqual({
        createdAt: new Date(1),
        id: '1',
        size: 1,
        type: 'image/png',
        name: 'test',
        url: 'blob:test',
        updatedAt: new Date(2),
      });
    });

    it('should throw an error when the file is not found', async () => {
      const fileId = 'non-existent';
      (FileModel.findById as Mock).mockResolvedValue(null);

      const getFilePromise = fileService.getFile(fileId);

      await expect(getFilePromise).rejects.toThrow('file not found');
    });
  });
});
