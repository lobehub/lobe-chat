import * as fs from 'node:fs';
import * as path from 'node:path';
import { promisify } from 'node:util';

import FileSearchService from '@/services/fileSearchSrv';

import { ControllerModule, ipcClientEvent } from './index';

const readFilePromise = promisify(fs.readFile);
const statPromise = promisify(fs.stat);

// 定义一个接口来表示读取文件的返回结果
interface ReadFileResult {
  content: string;
  createdTime: Date;
  fileType: string;
  filename: string;
  modifiedTime: Date;
}

export default class FileSearchCtr extends ControllerModule {
  private get searchService() {
    return this.app.getService(FileSearchService);
  }

  @ipcClientEvent('searchFiles')
  async searchFiles(query: string) {
    return this.searchService.search(query);
  }

  @ipcClientEvent('readFiles')
  async readFiles(paths: string[]): Promise<ReadFileResult[]> {
    const results: ReadFileResult[] = [];

    for (const filePath of paths) {
      try {
        // 获取文件状态信息
        const stats = await statPromise(filePath);

        // 获取文件名
        const filename = path.basename(filePath);

        // 获取文件扩展名
        const fileType = path.extname(filePath).toLowerCase().replace('.', '');

        // 初始化结果对象
        const result: ReadFileResult = {
          content: '',
          createdTime: stats.birthtime,
          fileType,
          filename,
          modifiedTime: stats.mtime,
        };

        // 判断文件是否可以以纯文本方式读取
        if (this.isTextReadableFile(fileType) && !stats.isDirectory()) {
          try {
            // 尝试读取文件内容
            result.content = await readFilePromise(filePath, 'utf8');
          } catch (error) {
            // 读取失败，设置错误信息
            result.content = `Failed to read file content: ${(error as Error).message}`;
          }
        } else if (stats.isDirectory()) {
          // 目录不能以文本方式读取
          result.content = 'This is a directory and cannot be read as plain text.';
        } else {
          // 不可读取的文件类型
          result.content = 'This file cannot be read as plain text.';
        }

        results.push(result);
      } catch (error) {
        // 处理文件不存在或无法访问的情况
        results.push({
          content: `Error accessing file: ${(error as Error).message}`,
          createdTime: new Date(),
          fileType: 'unknown',
          filename: path.basename(filePath),
          modifiedTime: new Date(),
        });
      }
    }

    return results;
  }

  /**
   * Determine if a file can be read as text
   * @param fileType File extension
   * @returns Whether the file can be read as text
   */
  private isTextReadableFile(fileType: string): boolean {
    // Common file types that can be read as text
    const textReadableTypes = [
      'txt',
      'md',
      'json',
      'xml',
      'html',
      'htm',
      'css',
      'scss',
      'less',
      'js',
      'ts',
      'jsx',
      'tsx',
      'vue',
      'svelte',
      'php',
      'py',
      'rb',
      'java',
      'c',
      'cpp',
      'h',
      'hpp',
      'cs',
      'go',
      'rs',
      'swift',
      'kt',
      'sh',
      'bat',
      'yml',
      'yaml',
      'toml',
      'ini',
      'cfg',
      'conf',
      'log',
      'svg',
      'csv',
      'sql',
    ];

    return textReadableTypes.includes(fileType.toLowerCase());
  }
}
