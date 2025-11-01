import { beforeEach, describe, expect, it, vi } from 'vitest';

import { fileEnv } from '@/envs/file';
import { lambdaClient } from '@/libs/trpc/client';
import { API_ENDPOINTS } from '@/services/_url';
import { clientS3Storage } from '@/services/file/ClientS3';

import { UPLOAD_NETWORK_ERROR, uploadService } from '../upload';

// Mock dependencies
vi.mock('@lobechat/const', () => ({
  isDesktop: false,
  isServerMode: false,
}));

vi.mock('@lobechat/model-runtime', () => ({
  parseDataUri: vi.fn(),
}));

vi.mock('@lobechat/utils', () => ({
  uuid: () => 'mock-uuid',
}));

vi.mock('@/libs/trpc/client', () => ({
  lambdaClient: {
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

vi.mock('@/store/electron', () => ({
  getElectronStoreState: vi.fn(() => ({})),
}));

vi.mock('@/store/electron/selectors', () => ({
  electronSyncSelectors: {
    isSyncActive: vi.fn(() => false),
  },
}));

vi.mock('@/services/electron/file', () => ({
  desktopFileAPI: {
    uploadFile: vi.fn(),
  },
}));

vi.mock('js-sha256', () => ({
  sha256: vi.fn((data) => 'mock-hash-' + data.byteLength),
}));

describe('UploadService', () => {
  const mockFile = new File(['test'], 'test.png', { type: 'image/png' });
  const mockPreSignUrl = 'https://example.com/presign';

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock Date.now
    vi.spyOn(Date, 'now').mockImplementation(() => 3600000); // 1 hour in milliseconds
  });

  describe('uploadFileToS3', () => {
    it('should upload to client S3 for non-server mode with image file', async () => {
      const { sha256 } = await import('js-sha256');
      vi.mocked(sha256).mockReturnValue('test-hash');
      vi.mocked(clientS3Storage.putObject).mockResolvedValue(undefined);

      const result = await uploadService.uploadFileToS3(mockFile, {});

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        date: '1',
        dirname: '',
        filename: mockFile.name,
        path: 'client-s3://test-hash',
      });
      expect(clientS3Storage.putObject).toHaveBeenCalledWith('test-hash', mockFile);
    });

    it('should call onNotSupported for non-image/video files', async () => {
      const nonImageFile = new File(['test'], 'test.txt', { type: 'text/plain' });
      const onNotSupported = vi.fn();

      const result = await uploadService.uploadFileToS3(nonImageFile, {
        onNotSupported,
      });

      expect(result.success).toBe(false);
      expect(onNotSupported).toHaveBeenCalled();
    });

    it('should skip file type check when skipCheckFileType is true', async () => {
      const nonImageFile = new File(['test'], 'test.txt', { type: 'text/plain' });
      const { sha256 } = await import('js-sha256');
      vi.mocked(sha256).mockReturnValue('test-hash');
      vi.mocked(clientS3Storage.putObject).mockResolvedValue(undefined);

      const result = await uploadService.uploadFileToS3(nonImageFile, {
        skipCheckFileType: true,
      });

      expect(result.success).toBe(true);
      expect(clientS3Storage.putObject).toHaveBeenCalled();
    });

    it('should upload video files', async () => {
      const videoFile = new File(['test'], 'test.mp4', { type: 'video/mp4' });
      const { sha256 } = await import('js-sha256');
      vi.mocked(sha256).mockReturnValue('video-hash');
      vi.mocked(clientS3Storage.putObject).mockResolvedValue(undefined);

      const result = await uploadService.uploadFileToS3(videoFile, {});

      expect(result.success).toBe(true);
      expect(clientS3Storage.putObject).toHaveBeenCalledWith('video-hash', videoFile);
    });
  });

  describe('uploadBase64ToS3', () => {
    it('should upload base64 data successfully', async () => {
      const { parseDataUri } = await import('@lobechat/model-runtime');
      vi.mocked(parseDataUri).mockReturnValueOnce({
        base64: 'dGVzdA==', // "test" in base64
        mimeType: 'image/png',
        type: 'base64',
      });

      const { sha256 } = await import('js-sha256');
      vi.mocked(sha256).mockReturnValue('base64-hash');
      vi.mocked(clientS3Storage.putObject).mockResolvedValue(undefined);

      const base64Data = 'data:image/png;base64,dGVzdA==';
      const result = await uploadService.uploadBase64ToS3(base64Data);

      expect(result).toMatchObject({
        fileType: 'image/png',
        hash: expect.any(String),
        metadata: expect.objectContaining({
          path: expect.stringContaining('client-s3://'),
        }),
        size: expect.any(Number),
      });
    });

    it('should throw error for invalid base64 data', async () => {
      const { parseDataUri } = await import('@lobechat/model-runtime');
      vi.mocked(parseDataUri).mockReturnValueOnce({
        base64: null,
        mimeType: null,
        type: 'url',
      });

      const invalidBase64 = 'not-a-base64-string';

      await expect(uploadService.uploadBase64ToS3(invalidBase64)).rejects.toThrow(
        'Invalid base64 data for image',
      );
    });

    it('should use custom filename when provided', async () => {
      const { parseDataUri } = await import('@lobechat/model-runtime');
      vi.mocked(parseDataUri).mockReturnValueOnce({
        base64: 'dGVzdA==',
        mimeType: 'image/png',
        type: 'base64',
      });

      const { sha256 } = await import('js-sha256');
      vi.mocked(sha256).mockReturnValue('custom-hash');
      vi.mocked(clientS3Storage.putObject).mockResolvedValue(undefined);

      const base64Data = 'data:image/png;base64,dGVzdA==';
      const result = await uploadService.uploadBase64ToS3(base64Data, {
        filename: 'custom-image',
      });

      expect(result.metadata.filename).toContain('custom-image');
    });
  });

  describe('uploadDataToS3', () => {
    it('should upload JSON data successfully', async () => {
      const { sha256 } = await import('js-sha256');
      vi.mocked(sha256).mockReturnValue('json-hash');
      vi.mocked(clientS3Storage.putObject).mockResolvedValue(undefined);

      const data = { key: 'value', number: 123 };
      // uploadDataToS3 internally calls uploadFileToS3, which needs skipCheckFileType for JSON
      const result = await uploadService.uploadDataToS3(data, {
        skipCheckFileType: true,
      });

      expect(result.success).toBe(true);
      expect(clientS3Storage.putObject).toHaveBeenCalled();
    });

    it('should use custom filename when provided', async () => {
      const { sha256 } = await import('js-sha256');
      vi.mocked(sha256).mockReturnValue('custom-json-hash');
      vi.mocked(clientS3Storage.putObject).mockResolvedValue(undefined);

      const data = { test: true };
      const result = await uploadService.uploadDataToS3(data, {
        filename: 'custom.json',
        skipCheckFileType: true,
      });

      expect(result.success).toBe(true);
      expect(result.data.filename).toBe('custom.json');
    });
  });

  describe('uploadToServerS3', () => {
    beforeEach(() => {
      // Mock XMLHttpRequest
      const xhrMock = {
        addEventListener: vi.fn(),
        open: vi.fn(),
        send: vi.fn(),
        setRequestHeader: vi.fn(),
        status: 200,
        upload: {
          addEventListener: vi.fn(),
        },
      };
      global.XMLHttpRequest = vi.fn(() => xhrMock) as any;

      // Mock createS3PreSignedUrl
      vi.mocked(lambdaClient.upload.createS3PreSignedUrl.mutate).mockResolvedValue(mockPreSignUrl);
    });

    it('should upload file successfully with progress', async () => {
      const onProgress = vi.fn();
      const xhr = new XMLHttpRequest();

      // Simulate successful upload
      vi.spyOn(xhr, 'addEventListener').mockImplementation((event, handler) => {
        if (event === 'load') {
          // @ts-expect-error - mock implementation
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

    it('should report progress during upload', async () => {
      const onProgress = vi.fn();
      const xhr = new XMLHttpRequest();

      // Simulate progress events
      vi.spyOn(xhr.upload, 'addEventListener').mockImplementation((event, handler) => {
        if (event === 'progress') {
          // @ts-expect-error - mock implementation
          handler({
            lengthComputable: true,
            loaded: 500,
            total: 1000,
          });
        }
      });

      vi.spyOn(xhr, 'addEventListener').mockImplementation((event, handler) => {
        if (event === 'load') {
          // @ts-expect-error - mock implementation
          handler({ target: { status: 200 } });
        }
      });

      await uploadService.uploadToServerS3(mockFile, { onProgress });

      expect(onProgress).toHaveBeenCalledWith(
        'uploading',
        expect.objectContaining({
          progress: expect.any(Number),
          restTime: expect.any(Number),
          speed: expect.any(Number),
        }),
      );
    });

    it('should handle network error', async () => {
      const xhr = new XMLHttpRequest();

      // Simulate network error
      vi.spyOn(xhr, 'addEventListener').mockImplementation((event, handler) => {
        if (event === 'error') {
          Object.assign(xhr, { status: 0 });
          // @ts-expect-error - mock implementation
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

          // @ts-expect-error - mock implementation
          handler({});
        }
      });

      await expect(uploadService.uploadToServerS3(mockFile, {})).rejects.toBe('Bad Request');
    });

    it('should use custom directory when provided', async () => {
      const xhr = new XMLHttpRequest();
      vi.spyOn(xhr, 'addEventListener').mockImplementation((event, handler) => {
        if (event === 'load') {
          // @ts-expect-error - mock implementation
          handler({ target: { status: 200 } });
        }
      });

      const result = await uploadService.uploadToServerS3(mockFile, {
        directory: 'custom/dir',
      });

      expect(result.dirname).toContain('custom/dir');
    });

    it('should use custom pathname when provided', async () => {
      const xhr = new XMLHttpRequest();
      vi.spyOn(xhr, 'addEventListener').mockImplementation((event, handler) => {
        if (event === 'load') {
          // @ts-expect-error - mock implementation
          handler({ target: { status: 200 } });
        }
      });

      const customPath = 'custom/path/file.png';
      const result = await uploadService.uploadToServerS3(mockFile, {
        pathname: customPath,
      });

      expect(result.path).toBe(customPath);
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

      vi.mocked(clientS3Storage.putObject).mockResolvedValue(undefined);

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

      vi.mocked(global.fetch).mockResolvedValue({
        arrayBuffer: () => Promise.resolve(mockArrayBuffer),
      } as Response);

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

      vi.mocked(global.fetch).mockResolvedValue({
        arrayBuffer: () => Promise.resolve(mockArrayBuffer),
      } as Response);

      const result = await uploadService.getImageFileByUrlWithCORS(url, filename, fileType);

      expect(result.type).toBe(fileType);
    });
  });
});
