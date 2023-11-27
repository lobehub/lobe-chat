import { Mock, beforeEach, describe, expect, it, vi } from 'vitest';

import { FileModel } from '@/database/models/file';
import { DB_File } from '@/database/schemas/files';

import { fileService } from '../file';

// Mocks for the FileModel
vi.mock('@/database/models/file', () => ({
  FileModel: {
    create: vi.fn(),
    delete: vi.fn(),
    findById: vi.fn(),
  },
}));

// Mocks for the URL and Blob objects
global.URL.createObjectURL = vi.fn();
global.Blob = vi.fn();

describe('FileService', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.resetAllMocks();
  });

  it('uploadFile should save the file to the database', async () => {
    const localFile: DB_File = {
      name: 'test',
      data: new ArrayBuffer(1),
      fileType: 'image/png',
      saveMode: 'local',
      size: 1,
    };

    (FileModel.create as Mock).mockResolvedValue(localFile);

    const result = await fileService.uploadFile(localFile);

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

  it('getFile should retrieve and convert file info to FilePreview', async () => {
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

  it('getFile should throw an error when the file is not found', async () => {
    const fileId = 'non-existent';
    (FileModel.findById as Mock).mockResolvedValue(null);

    const getFilePromise = fileService.getFile(fileId);

    await expect(getFilePromise).rejects.toThrow('file not found');
  });
});
