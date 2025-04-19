import {
  ListLocalFileParams,
  LocalReadFileParams,
  LocalReadFileResult,
  LocalReadFilesParams,
  LocalSearchFilesParams,
  OpenLocalFileParams,
  OpenLocalFolderParams,
} from '@lobechat/electron-client-ipc';
import { shell } from 'electron';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { promisify } from 'node:util';

import FileSearchService from '@/services/fileSearchSrv';
import { FileResult, SearchOptions } from '@/types/fileSearch';

import { ControllerModule, ipcClientEvent } from './index';

const readFilePromise = promisify(fs.readFile);
const statPromise = promisify(fs.stat);
const readdirPromise = promisify(fs.readdir);

export default class FileSearchCtr extends ControllerModule {
  private get searchService() {
    return this.app.getService(FileSearchService);
  }

  /**
   * Handle IPC event for local file search
   */
  @ipcClientEvent('searchLocalFiles')
  async handleLocalFilesSearch(params: LocalSearchFilesParams): Promise<FileResult[]> {
    const options: Omit<SearchOptions, 'keywords'> = {
      limit: 30,
    };

    return this.searchService.search(params.keywords, options);
  }

  @ipcClientEvent('openLocalFile')
  async handleOpenLocalFile({ path: filePath }: OpenLocalFileParams): Promise<{
    error?: string;
    success: boolean;
  }> {
    try {
      await shell.openPath(filePath);
      return { success: true };
    } catch (error) {
      console.error(`Failed to open file ${filePath}:`, error);
      return { error: (error as Error).message, success: false };
    }
  }

  @ipcClientEvent('openLocalFolder')
  async handleOpenLocalFolder({ path: targetPath, isDirectory }: OpenLocalFolderParams): Promise<{
    error?: string;
    success: boolean;
  }> {
    try {
      const folderPath = isDirectory ? targetPath : path.dirname(targetPath);
      await shell.openPath(folderPath);
      return { success: true };
    } catch (error) {
      console.error(`Failed to open folder for path ${targetPath}:`, error);
      return { error: (error as Error).message, success: false };
    }
  }

  @ipcClientEvent('readLocalFiles')
  async readFiles({ paths }: LocalReadFilesParams): Promise<LocalReadFileResult[]> {
    const results: LocalReadFileResult[] = [];

    for (const filePath of paths) {
      // 初始化结果对象
      const result = await this.readFile({ path: filePath });

      results.push(result);
    }

    return results;
  }

  @ipcClientEvent('readLocalFile')
  async readFile({ path: filePath }: LocalReadFileParams): Promise<LocalReadFileResult> {
    try {
      // 获取文件状态信息
      const stats = await statPromise(filePath);

      // 获取文件名
      const filename = path.basename(filePath);

      // 获取文件扩展名
      const fileType = path.extname(filePath).toLowerCase().replace('.', '');

      // 初始化结果对象
      const result: LocalReadFileResult = {
        charCount: 0,
        content: '',
        createdTime: stats.birthtime,
        fileType,
        filename,
        lineCount: 0,
        modifiedTime: stats.mtime,
      };

      // 判断文件是否可以以纯文本方式读取
      if (this.isTextReadableFile(fileType) && !stats.isDirectory()) {
        try {
          // 尝试读取文件内容
          const content = await readFilePromise(filePath, 'utf8');
          result.content = content;
          result.charCount = content.length;
          result.lineCount = content.split('\n').length;
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

      return result;
    } catch (error) {
      // 处理文件不存在或无法访问的情况
      return {
        charCount: 0,
        content: `Error accessing file: ${(error as Error).message}`,
        createdTime: new Date(),
        fileType: 'unknown',
        filename: path.basename(filePath),
        lineCount: 0,
        modifiedTime: new Date(),
      };
    }
  }

  @ipcClientEvent('listLocalFiles')
  async listLocalFiles({ path: dirPath }: ListLocalFileParams): Promise<FileResult[]> {
    const results: FileResult[] = [];
    try {
      const entries = await readdirPromise(dirPath);

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry);
        try {
          const stats = await statPromise(fullPath);
          const isDirectory = stats.isDirectory();
          results.push({
            createdTime: stats.birthtime,
            isDirectory,
            lastAccessTime: stats.atime,
            modifiedTime: stats.mtime,
            name: entry,
            path: fullPath,
            size: stats.size,
            type: isDirectory ? 'directory' : path.extname(entry).toLowerCase().replace('.', ''),
          });
        } catch (statError) {
          // Silently ignore files we can't stat (e.g. permissions)
          console.error(`Failed to stat ${fullPath}:`, statError);
        }
      }

      // Sort entries: folders first, then by name
      results.sort((a, b) => {
        if (a.isDirectory !== b.isDirectory) {
          return a.isDirectory ? -1 : 1; // Directories first
        }
        // Add null/undefined checks for robustness if needed, though names should exist
        return (a.name || '').localeCompare(b.name || ''); // Then sort by name
      });

      return results;
    } catch (error) {
      console.error(`Failed to list directory ${dirPath}:`, error);
      // Rethrow or return an empty array/error object depending on desired behavior
      // For now, returning empty array on error listing directory itself
      return [];
    }
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
