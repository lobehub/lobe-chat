import { beforeAll, describe, expect, it, vi } from 'vitest';

import { DB_File } from '@/database/client/schemas/files';
import { edgeClient } from '@/libs/trpc/client';
import { API_ENDPOINTS } from '@/services/_url';
import { serverConfigSelectors } from '@/store/serverConfig/selectors';
import { createServerConfigStore } from '@/store/serverConfig/store';

import { uploadService } from '../upload';

vi.mock('@/store/serverConfig/selectors');
vi.mock('@/libs/trpc/client', () => {
  return {
    edgeClient: {
      upload: {
        createS3PreSignedUrl: { mutate: vi.fn() },
      },
    },
  };
});

beforeAll(() => {
  createServerConfigStore();
});

describe('UploadService', () => {
  describe('uploadFile', () => {
    it('should upload file to server when enableServer is true', async () => {
      // Arrange
      const file: DB_File = {
        data: new ArrayBuffer(10),
        fileType: 'text/plain',
        metadata: {},
        name: 'test.txt',
        saveMode: 'local',
        size: 10,
      };
      const mockCreateS3Url = vi.fn().mockResolvedValue('https://example.com');
      vi.mocked(edgeClient.upload.createS3PreSignedUrl.mutate).mockImplementation(mockCreateS3Url);
      vi.spyOn(serverConfigSelectors, 'enableUploadFileToServer').mockReturnValue(true);
      global.fetch = vi.fn().mockResolvedValue({ ok: true } as Response);

      // Act
      const result = await uploadService.uploadFile(file);

      // Assert
      expect(mockCreateS3Url).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(result.url).toMatch(/\/\d+\/[a-f0-9-]+\.txt/);
      expect(result.saveMode).toBe('url');
    });

    it('should save file locally when enableServer is false', async () => {
      // Arrange
      const file: DB_File = {
        data: new ArrayBuffer(10),
        fileType: 'text/plain',
        metadata: {},
        name: 'test.txt',
        saveMode: 'local',
        size: 10,
      };
      vi.spyOn(serverConfigSelectors, 'enableUploadFileToServer').mockReturnValue(false);

      // Act
      const result = await uploadService.uploadFile(file);

      // Assert
      expect(result).toEqual(file);
    });
  });
});
