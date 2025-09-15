import { beforeEach, describe, expect, it, vi } from 'vitest';

import { fileEnv } from '@/envs/file';
import { edgeClient } from '@/libs/trpc/client';
import { API_ENDPOINTS } from '@/services/_url';
import { clientS3Storage } from '@/services/file/ClientS3';

import { UPLOAD_NETWORK_ERROR, uploadService } from '../upload';

// Mock dependencies
vi.mock('@/libs/trpc/client', () => ({
  edgeClient: {
    upload: {
      createS3PreSignedUrl: {
        mutate: vi.fn(),
      },
    },
  },
}));

vi.mock('@/services/file/ClientS3', () => ({
  clientS3Storage: {
    putObject: vi.fn(),
  },
}));

vi.mock('@/utils/uuid', () => ({
  uuid: () => 'mock-uuid',
}));

describe('UploadService', () => {
  const mockFile = new File(['test'], 'test.png', { type: 'image/png' });
  const mockPreSignUrl = 'https://example.com/presign';

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock Date.now
    vi.spyOn(Date, 'now').mockImplementation(() => 3600000); // 1 hour in milliseconds
  });

  describe('uploadWithProgress', () => {
    beforeEach(() => {
      // Mock XMLHttpRequest
      const xhrMock = {
        upload: {
          addEventListener: vi.fn(),
        },
        open: vi.fn(),
        send: vi.fn(),
        setRequestHeader: vi.fn(),
        addEventListener: vi.fn(),
        status: 200,
      };
      global.XMLHttpRequest = vi.fn(() => xhrMock) as any;

      // Mock createS3PreSignedUrl
      (edgeClient.upload.createS3PreSignedUrl.mutate as any).mockResolvedValue(mockPreSignUrl);
    });

    it('should upload file successfully with progress', async () => {
      const onProgress = vi.fn();
      const xhr = new XMLHttpRequest();

      // Simulate successful upload
      vi.spyOn(xhr, 'addEventListener').mockImplementation((event, handler) => {
        if (event === 'load') {
          // @ts-ignore
          handler({ target: { status: 200 } });
        }
      });

      const result = await uploadService.uploadToServerS3(mockFile, { onProgress });

      expect(result).toEqual({
        date: '1',
        dirname: `${fileEnv.NEXT_PUBLIC_S3_FILE_PATH}/1`,
        filename: 'mock-uuid.png',
        path: `${fileEnv.NEXT_PUBLIC_S3_FILE_PATH}/1/mock-uuid.png`,
      });
    });

    it('should handle network error', async () => {
      const xhr = new XMLHttpRequest();

      // Simulate network error
      vi.spyOn(xhr, 'addEventListener').mockImplementation((event, handler) => {
        if (event === 'error') {
          Object.assign(xhr, { status: 0 });
          // @ts-ignore
          handler({});
        }
      });

      await expect(uploadService.uploadToServerS3(mockFile, {})).rejects.toBe(UPLOAD_NETWORK_ERROR);
    });

    it('should handle upload error', async () => {
      const xhr = new XMLHttpRequest();

      // Simulate upload error
      vi.spyOn(xhr, 'addEventListener').mockImplementation((event, handler) => {
        if (event === 'load') {
          Object.assign(xhr, { status: 400, statusText: 'Bad Request' });

          // @ts-ignore
          handler({});
        }
      });

      await expect(uploadService.uploadToServerS3(mockFile, {})).rejects.toBe('Bad Request');
    });
  });

  describe('uploadToClientS3', () => {
    it('should upload file to client S3 successfully', async () => {
      const hash = 'test-hash';
      const expectedResult = {
        date: '1',
        dirname: '',
        filename: mockFile.name,
        path: `client-s3://${hash}`,
      };

      (clientS3Storage.putObject as any).mockResolvedValue(undefined);

      const result = await uploadService['uploadToClientS3'](hash, mockFile);

      expect(clientS3Storage.putObject).toHaveBeenCalledWith(hash, mockFile);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getImageFileByUrlWithCORS', () => {
    beforeEach(() => {
      global.fetch = vi.fn();
    });

    it('should fetch and create file from URL', async () => {
      const url = 'https://example.com/image.png';
      const filename = 'test.png';
      const mockArrayBuffer = new ArrayBuffer(8);

      (global.fetch as any).mockResolvedValue({
        arrayBuffer: () => Promise.resolve(mockArrayBuffer),
      });

      const result = await uploadService.getImageFileByUrlWithCORS(url, filename);

      expect(global.fetch).toHaveBeenCalledWith(API_ENDPOINTS.proxy, {
        body: url,
        method: 'POST',
      });
      expect(result).toBeInstanceOf(File);
      expect(result.name).toBe(filename);
      expect(result.type).toBe('image/png');
    });

    it('should handle custom file type', async () => {
      const url = 'https://example.com/image.jpg';
      const filename = 'test.jpg';
      const fileType = 'image/jpeg';
      const mockArrayBuffer = new ArrayBuffer(8);

      (global.fetch as any).mockResolvedValue({
        arrayBuffer: () => Promise.resolve(mockArrayBuffer),
      });

      const result = await uploadService.getImageFileByUrlWithCORS(url, filename, fileType);

      expect(result.type).toBe(fileType);
    });
  });
});
