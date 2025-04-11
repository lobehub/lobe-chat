import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { electronIpcClient } from '@/server/modules/ElectronIPCClient';

import { DesktopLocalFileImpl } from './local';

// 模拟依赖项
vi.mock('node:fs', async (importOriginal) => ({
  ...((await importOriginal()) as any),
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
}));

vi.mock('@/server/modules/ElectronIPCClient', () => ({
  electronIpcClient: {
    getFilePathById: vi.fn(),
    deleteFiles: vi.fn(),
  },
}));

describe('DesktopLocalFileImpl', () => {
  let service: DesktopLocalFileImpl;
  const testFilePath = '/path/to/file.txt';
  const testFileKey = 'desktop://file.txt';
  const testFileContent = 'test file content';
  const testFileBuffer = Buffer.from(testFileContent);

  beforeEach(() => {
    service = new DesktopLocalFileImpl();

    // 重置所有模拟
    vi.resetAllMocks();

    // 设置默认模拟行为
    vi.mocked(electronIpcClient.getFilePathById).mockResolvedValue(testFilePath);
    vi.mocked(existsSync).mockReturnValue(true);
    vi.mocked(readFileSync).mockReturnValueOnce(testFileBuffer);
  });

  describe('getLocalFileUrl', () => {
    it.skip('应该正确获取本地文件URL并转换为data URL', async () => {
      // 准备: readFileSync在第一次被调用时返回文件内容
      vi.mocked(readFileSync).mockReturnValueOnce(testFileBuffer);

      // 使用私有方法进行测试，通过原型访问
      const result = await (service as any).getLocalFileUrl(testFileKey);

      // 验证
      expect(electronIpcClient.getFilePathById).toHaveBeenCalledWith(testFileKey);
      expect(existsSync).toHaveBeenCalledWith(testFilePath);
      expect(readFileSync).toHaveBeenCalledWith(testFilePath);

      // 验证返回的data URL格式正确
      expect(result).toContain('data:text/plain;base64,');
      expect(result).toContain(testFileBuffer.toString('base64'));
    });

    it('当文件不存在时应返回原始键', async () => {
      // 准备: 文件不存在
      vi.mocked(existsSync).mockReturnValueOnce(false);

      // 使用私有方法进行测试
      const result = await (service as any).getLocalFileUrl(testFileKey);

      // 验证
      expect(result).toBe(testFileKey);
    });

    it('当发生错误时应返回空字符串', async () => {
      // 准备: 模拟错误
      vi.mocked(electronIpcClient.getFilePathById).mockRejectedValueOnce(new Error('测试错误'));

      // 使用私有方法进行测试
      const result = await (service as any).getLocalFileUrl(testFileKey);

      // 验证
      expect(result).toBe('');
    });
  });

  describe('getMimeTypeFromPath', () => {
    it('应该返回正确的MIME类型', () => {
      // 使用私有方法进行测试
      const jpgResult = (service as any).getMimeTypeFromPath('test.jpg');
      const pngResult = (service as any).getMimeTypeFromPath('test.png');
      const unknownResult = (service as any).getMimeTypeFromPath('test.unknown');

      // 验证
      expect(jpgResult).toBe('image/jpeg');
      expect(pngResult).toBe('image/png');
      expect(unknownResult).toBe('application/octet-stream');
    });
  });

  describe('createPreSignedUrl', () => {
    it('应该返回原始键', async () => {
      const result = await service.createPreSignedUrl(testFileKey);

      expect(result).toBe(testFileKey);
    });
  });

  describe('createPreSignedUrlForPreview', () => {
    it('应该调用getLocalFileUrl获取预览URL', async () => {
      // 准备
      const getLocalFileUrlSpy = vi.spyOn(service as any, 'getLocalFileUrl');
      getLocalFileUrlSpy.mockResolvedValueOnce('data:text/plain;base64,dGVzdA==');

      // 执行
      const result = await service.createPreSignedUrlForPreview(testFileKey);

      // 验证
      expect(getLocalFileUrlSpy).toHaveBeenCalledWith(testFileKey);
      expect(result).toBe('data:text/plain;base64,dGVzdA==');
    });
  });

  describe('deleteFile', () => {
    it('应该调用deleteFiles方法删除单个文件', async () => {
      // 准备
      vi.mocked(electronIpcClient.deleteFiles).mockResolvedValueOnce({ success: true });
      const deleteFilesSpy = vi.spyOn(service, 'deleteFiles');

      // 执行
      await service.deleteFile(testFileKey);

      // 验证
      expect(deleteFilesSpy).toHaveBeenCalledWith([testFileKey]);
    });
  });

  describe('deleteFiles', () => {
    it('应该成功删除有效的文件', async () => {
      // 准备
      const keys = ['desktop://file1.txt', 'desktop://file2.png'];
      vi.mocked(electronIpcClient.deleteFiles).mockResolvedValueOnce({ success: true });

      // 执行
      const result = await service.deleteFiles(keys);

      // 验证
      expect(electronIpcClient.deleteFiles).toHaveBeenCalledWith(keys);
      expect(result).toEqual({ success: true });
    });

    it('当提供无效键时应返回错误', async () => {
      // 准备: 包含无效的文件路径
      const keys = ['invalid://file1.txt', 'desktop://file2.png'];

      // 执行
      const result = await service.deleteFiles(keys);

      // 验证
      expect(electronIpcClient.deleteFiles).not.toHaveBeenCalled();
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors!.length).toBe(1);
      expect(result.errors![0].path).toBe('invalid://file1.txt');
    });

    it('当未提供键时应返回成功', async () => {
      // 执行
      const result = await service.deleteFiles([]);

      // 验证
      expect(electronIpcClient.deleteFiles).not.toHaveBeenCalled();
      expect(result).toEqual({ success: true });
    });

    it('当删除过程中出现错误时应正确处理', async () => {
      // 准备
      const keys = ['desktop://file1.txt'];
      vi.mocked(electronIpcClient.deleteFiles).mockRejectedValueOnce(new Error('删除错误'));

      // 执行
      const result = await service.deleteFiles(keys);

      // 验证
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors![0].message).toContain('删除错误');
    });
  });

  describe.skip('getFileByteArray', () => {
    it('应该返回文件的字节数组', async () => {
      // 准备
      vi.mocked(readFileSync).mockReturnValueOnce(Buffer.from('测试内容'));

      // 执行
      const result = await service.getFileByteArray(testFileKey);

      // 验证
      expect(electronIpcClient.getFilePathById).toHaveBeenCalledWith(testFileKey);
      expect(existsSync).toHaveBeenCalledWith(testFilePath);
      expect(readFileSync).toHaveBeenCalledWith(testFilePath);
      expect(result).toBeInstanceOf(Uint8Array);
      expect(Buffer.from(result).toString()).toBe('测试内容');
    });

    it('当文件不存在时应返回空数组', async () => {
      // 准备
      vi.mocked(existsSync).mockReturnValueOnce(false);

      // 执行
      const result = await service.getFileByteArray(testFileKey);

      // 验证
      expect(result).toBeInstanceOf(Uint8Array);
      expect(result.length).toBe(0);
    });

    it('当发生错误时应返回空数组', async () => {
      // 准备
      vi.mocked(electronIpcClient.getFilePathById).mockRejectedValueOnce(new Error('测试错误'));

      // 执行
      const result = await service.getFileByteArray(testFileKey);

      // 验证
      expect(result).toBeInstanceOf(Uint8Array);
      expect(result.length).toBe(0);
    });
  });

  describe.skip('getFileContent', () => {
    it('应该返回文件内容', async () => {
      // 准备
      vi.mocked(readFileSync).mockReturnValueOnce('文件内容');

      // 执行
      const result = await service.getFileContent(testFileKey);

      // 验证
      expect(electronIpcClient.getFilePathById).toHaveBeenCalledWith(testFileKey);
      expect(existsSync).toHaveBeenCalledWith(testFilePath);
      expect(readFileSync).toHaveBeenCalledWith(testFilePath, 'utf8');
      expect(result).toBe('文件内容');
    });

    it('当文件不存在时应返回空字符串', async () => {
      // 准备
      vi.mocked(existsSync).mockReturnValueOnce(false);

      // 执行
      const result = await service.getFileContent(testFileKey);

      // 验证
      expect(result).toBe('');
    });

    it('当发生错误时应返回空字符串', async () => {
      // 准备
      vi.mocked(electronIpcClient.getFilePathById).mockRejectedValueOnce(new Error('测试错误'));

      // 执行
      const result = await service.getFileContent(testFileKey);

      // 验证
      expect(result).toBe('');
    });
  });

  describe('getFullFileUrl', () => {
    it('应该调用getLocalFileUrl获取完整URL', async () => {
      // 准备
      const getLocalFileUrlSpy = vi.spyOn(service as any, 'getLocalFileUrl');
      getLocalFileUrlSpy.mockResolvedValueOnce('data:image/png;base64,test');

      // 执行
      const result = await service.getFullFileUrl(testFileKey);

      // 验证
      expect(getLocalFileUrlSpy).toHaveBeenCalledWith(testFileKey);
      expect(result).toBe('data:image/png;base64,test');
    });

    it('当url为空时应返回空字符串', async () => {
      // 执行
      const result = await service.getFullFileUrl(null);

      // 验证
      expect(result).toBe('');
    });
  });

  describe('uploadContent', () => {
    it('应该正确处理上传内容的请求', async () => {
      // 目前这个方法未实现，仅验证调用不会导致错误
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      await service.uploadContent('path/to/file', 'content');

      expect(consoleSpy).toHaveBeenCalled();
    });
  });
});
