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
    expect(result).toEqual(localFile);
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
      const fileData: DB_File = {
        name: 'test',
        data: new ArrayBuffer(1),
        fileType: 'image/png',
        saveMode: 'local',
        size: 1,
      };

      (FileModel.findById as Mock).mockResolvedValue(fileData);
      (global.URL.createObjectURL as Mock).mockReturnValue('blob:test');
      (global.Blob as Mock).mockImplementation(() => ['test']);

      const result = await fileService.getFile(fileId);

      expect(FileModel.findById).toHaveBeenCalledWith(fileId);
      expect(result).toEqual({
        base64Url: 'data:image/png;base64,AA==',
        fileType: 'image/png',
        name: 'test',
        saveMode: 'local',
        url: 'blob:test',
      });
    });

    it('should retrieve and convert URL file info to FilePreview when enableServer is true', async () => {
      const fileId = '1';
      const fileData: DB_File = {
        name: 'test',
        fileType: 'image/png',
        saveMode: 'url',
        metadata: {
          filename: 'test.png',
        },
        size: 1,
        url: '/test.png',
      };

      (FileModel.findById as Mock).mockResolvedValue(fileData);
      vi.spyOn(serverConfigSelectors, 'enableUploadFileToServer').mockReturnValue(true);
      s3Domain = 'https://example.com';

      const result = await fileService.getFile(fileId);

      expect(FileModel.findById).toHaveBeenCalledWith(fileId);
      expect(result).toEqual({
        fileType: 'image/png',
        name: 'test.png',
        saveMode: 'url',
        url: 'https://example.com/test.png',
      });
    });

    it('should throw an error when enableServer is true but NEXT_PUBLIC_S3_DOMAIN is not set', async () => {
      const fileId = '1';
      const fileData: DB_File = {
        name: 'test',
        fileType: 'image/png',
        saveMode: 'url',
        size: 1,
        url: '/test.png',
      };

      (FileModel.findById as Mock).mockResolvedValue(fileData);
      vi.spyOn(serverConfigSelectors, 'enableUploadFileToServer').mockReturnValue(true);

      const getFilePromise = fileService.getFile(fileId);

      await expect(getFilePromise).rejects.toThrow(
        'fileEnv.NEXT_PUBLIC_S3_DOMAIN is not set while enable server upload',
      );
    });

    it('should throw an error when the file is not found', async () => {
      const fileId = 'non-existent';
      (FileModel.findById as Mock).mockResolvedValue(null);

      const getFilePromise = fileService.getFile(fileId);

      await expect(getFilePromise).rejects.toThrow('file not found');
    });
  });
});
