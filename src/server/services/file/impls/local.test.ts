import fs from 'fs';
import { describe, expect, it, vi } from 'vitest';

import { electronIpcClient } from '@/server/modules/ElectronIPCClient';

import { DesktopLocalFileImpl } from './local';

// 模拟 electronIpcClient
vi.mock('@/server/modules/ElectronIPCClient', () => ({
  electronIpcClient: {
    getFilePathById: vi.fn().mockResolvedValue('/path/to/test.jpg'),
  },
}));

// 模拟文件系统
vi.mock('fs', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as any),
    existsSync: vi.fn().mockReturnValue(true),
    readFileSync: vi.fn().mockReturnValue(Buffer.from('test image content')),
  };
});

describe('DesktopLocalFileImpl', () => {
  let fileService: DesktopLocalFileImpl;

  beforeEach(() => {
    fileService = new DesktopLocalFileImpl();
    vi.clearAllMocks();
  });

  describe('getFullFileUrl', () => {
    it('应该对null或undefined输入返回空字符串', async () => {
      expect(await fileService.getFullFileUrl(null)).toBe('');
      expect(await fileService.getFullFileUrl(undefined)).toBe('');
    });

    it('应该获取文件路径并转换为base64 data URL', async () => {
      const url = 'test.jpg';
      const result = await fileService.getFullFileUrl(url);

      expect(electronIpcClient.getFilePathById).toHaveBeenCalledWith(url);
      expect(fs.existsSync).toHaveBeenCalledWith('/path/to/test.jpg');
      expect(fs.readFileSync).toHaveBeenCalledWith('/path/to/test.jpg');

      // 检查生成的data URL格式
      expect(result).toContain('data:image/jpeg;base64,');
    });

    it('当文件不存在时应返回原始key', async () => {
      const url = 'missing.jpg';
      vi.mocked(fs.existsSync).mockReturnValueOnce(false);

      const result = await fileService.getFullFileUrl(url);

      expect(electronIpcClient.getFilePathById).toHaveBeenCalledWith(url);
      expect(result).toBe(url);
    });

    it('处理获取文件路径失败的情况，返回原始key', async () => {
      const url = 'fail.jpg';
      vi.mocked(electronIpcClient.getFilePathById).mockRejectedValueOnce(new Error('Failed'));

      const result = await fileService.getFullFileUrl(url);

      expect(electronIpcClient.getFilePathById).toHaveBeenCalledWith(url);
      expect(result).toBe(url);
    });
  });

  describe('getMimeTypeFromPath', () => {
    it('应该正确识别常见图片格式', async () => {
      // 使用类型断言访问私有方法进行测试
      const getMimeType = (fileService as any).getMimeTypeFromPath.bind(fileService);

      expect(getMimeType('/path/to/image.jpg')).toBe('image/jpeg');
      expect(getMimeType('/path/to/image.png')).toBe('image/png');
      expect(getMimeType('/path/to/image.gif')).toBe('image/gif');
    });

    it('对于未知扩展名应返回通用二进制类型', async () => {
      const getMimeType = (fileService as any).getMimeTypeFromPath.bind(fileService);

      expect(getMimeType('/path/to/unknown.xyz')).toBe('application/octet-stream');
    });
  });

  describe('createPreSignedUrl', () => {
    it('应该直接返回原始key', async () => {
      const key = 'test.jpg';
      expect(await fileService.createPreSignedUrl(key)).toBe(key);
    });
  });

  describe('createPreSignedUrlForPreview', () => {
    it('应该调用getLocalFileUrl获取预览URL', async () => {
      const key = 'test.jpg';
      const result = await fileService.createPreSignedUrlForPreview(key);

      expect(electronIpcClient.getFilePathById).toHaveBeenCalledWith(key);
      expect(result).toBe('file:///Users/test/Documents/test.jpg');
    });
  });

  // 以下方法在当前实现中只是占位符，测试它们返回预期的占位值
  describe('未实现的方法', () => {
    it('deleteFile应该返回resolved promise', async () => {
      const result = await fileService.deleteFile('test.jpg');
      expect(result).toBeUndefined();
    });

    it('deleteFiles应该返回resolved promise', async () => {
      const result = await fileService.deleteFiles(['test1.jpg', 'test2.jpg']);
      expect(result).toBeUndefined();
    });

    it('uploadContent应该返回resolved promise', async () => {
      const result = await fileService.uploadContent('test.jpg', 'content');
      expect(result).toBeUndefined();
    });
  });

  // 新增测试块，测试已实现的方法
  describe('getFileByteArray', () => {
    it('应该返回文件的字节数组', async () => {
      const key = 'test.jpg';
      const result = await fileService.getFileByteArray(key);

      expect(electronIpcClient.getFilePathById).toHaveBeenCalledWith(key);
      expect(fs.existsSync).toHaveBeenCalledWith('/path/to/test.jpg');
      expect(fs.readFileSync).toHaveBeenCalledWith('/path/to/test.jpg');
      expect(result).toBeInstanceOf(Uint8Array);
    });

    it('当文件不存在时应返回空Uint8Array', async () => {
      const key = 'missing.jpg';
      vi.mocked(fs.existsSync).mockReturnValueOnce(false);

      const result = await fileService.getFileByteArray(key);

      expect(result).toBeInstanceOf(Uint8Array);
      expect(result.length).toBe(0);
    });

    it('处理异常情况，返回空Uint8Array', async () => {
      const key = 'error.jpg';
      vi.mocked(electronIpcClient.getFilePathById).mockRejectedValueOnce(new Error('Failed'));

      const result = await fileService.getFileByteArray(key);

      expect(result).toBeInstanceOf(Uint8Array);
      expect(result.length).toBe(0);
    });
  });

  describe('getFileContent', () => {
    it('应该返回文件内容', async () => {
      // 模拟文本文件
      const key = 'test.txt';
      vi.mocked(fs.readFileSync).mockReturnValueOnce('file text content');

      const result = await fileService.getFileContent(key);

      expect(electronIpcClient.getFilePathById).toHaveBeenCalledWith(key);
      expect(fs.existsSync).toHaveBeenCalledWith('/path/to/test.jpg');
      expect(fs.readFileSync).toHaveBeenCalledWith('/path/to/test.jpg', 'utf8');
      expect(result).toBe('file text content');
    });

    it('当文件不存在时应返回空字符串', async () => {
      const key = 'missing.txt';
      vi.mocked(fs.existsSync).mockReturnValueOnce(false);

      const result = await fileService.getFileContent(key);

      expect(result).toBe('');
    });

    it('处理异常情况，返回空字符串', async () => {
      const key = 'error.txt';
      vi.mocked(electronIpcClient.getFilePathById).mockRejectedValueOnce(new Error('Failed'));

      const result = await fileService.getFileContent(key);

      expect(result).toBe('');
    });
  });
});
