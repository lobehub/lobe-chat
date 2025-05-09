import { beforeEach, describe, expect, it, vi } from 'vitest';

import { S3StaticFileImpl } from './s3';

const config = {
  S3_ENABLE_PATH_STYLE: false,
  S3_PUBLIC_DOMAIN: 'https://example.com',
  S3_BUCKET: 'my-bucket',
  S3_SET_ACL: true,
};

// 模拟 fileEnv
vi.mock('@/config/file', () => ({
  get fileEnv() {
    return config;
  },
}));

// 模拟 S3 类
vi.mock('@/server/modules/S3', () => ({
  S3: vi.fn().mockImplementation(() => ({
    createPreSignedUrlForPreview: vi
      .fn()
      .mockResolvedValue('https://presigned.example.com/test.jpg'),
    getFileContent: vi.fn().mockResolvedValue('file content'),
    getFileByteArray: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
    deleteFile: vi.fn().mockResolvedValue({}),
    deleteFiles: vi.fn().mockResolvedValue({}),
    createPreSignedUrl: vi.fn().mockResolvedValue('https://upload.example.com/test.jpg'),
    uploadContent: vi.fn().mockResolvedValue({}),
  })),
}));

describe('S3StaticFileImpl', () => {
  let fileService: S3StaticFileImpl;

  beforeEach(() => {
    fileService = new S3StaticFileImpl();
  });

  describe('getFullFileUrl', () => {
    it('should return empty string for null or undefined input', async () => {
      expect(await fileService.getFullFileUrl(null)).toBe('');
      expect(await fileService.getFullFileUrl(undefined)).toBe('');
    });

    it('当S3_SET_ACL为false时应返回预签名URL', async () => {
      config.S3_SET_ACL = false;
      const url = 'path/to/file.jpg';
      expect(await fileService.getFullFileUrl(url)).toBe('https://presigned.example.com/test.jpg');
      config.S3_SET_ACL = true;
    });

    it('should return correct URL when S3_ENABLE_PATH_STYLE is false', async () => {
      const url = 'path/to/file.jpg';
      expect(await fileService.getFullFileUrl(url)).toBe('https://example.com/path/to/file.jpg');
    });

    it('should return correct URL when S3_ENABLE_PATH_STYLE is true', async () => {
      config.S3_ENABLE_PATH_STYLE = true;
      const url = 'path/to/file.jpg';
      expect(await fileService.getFullFileUrl(url)).toBe(
        'https://example.com/my-bucket/path/to/file.jpg',
      );
      config.S3_ENABLE_PATH_STYLE = false;
    });
  });

  describe('getFileContent', () => {
    it('应该返回文件内容', async () => {
      expect(await fileService.getFileContent('test.txt')).toBe('file content');
    });
  });

  describe('getFileByteArray', () => {
    it('应该返回文件字节数组', async () => {
      const result = await fileService.getFileByteArray('test.jpg');
      expect(result).toBeInstanceOf(Uint8Array);
      expect(result.length).toBe(3);
    });
  });

  describe('deleteFile', () => {
    it('应该调用S3的deleteFile方法', async () => {
      await fileService.deleteFile('test.jpg');
      expect(fileService['s3'].deleteFile).toHaveBeenCalledWith('test.jpg');
    });
  });

  describe('deleteFiles', () => {
    it('应该调用S3的deleteFiles方法', async () => {
      await fileService.deleteFiles(['test1.jpg', 'test2.jpg']);
      expect(fileService['s3'].deleteFiles).toHaveBeenCalledWith(['test1.jpg', 'test2.jpg']);
    });
  });

  describe('createPreSignedUrl', () => {
    it('应该调用S3的createPreSignedUrl方法', async () => {
      const result = await fileService.createPreSignedUrl('test.jpg');
      expect(result).toBe('https://upload.example.com/test.jpg');
    });
  });

  describe('uploadContent', () => {
    it('应该调用S3的uploadContent方法', async () => {
      await fileService.uploadContent('test.jpg', 'content');
      expect(fileService['s3'].uploadContent).toHaveBeenCalledWith('test.jpg', 'content');
    });
  });
});
