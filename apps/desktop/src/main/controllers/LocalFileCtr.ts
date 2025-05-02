import {
  ListLocalFileParams,
  LocalMoveFilesResultItem,
  LocalReadFileParams,
  LocalReadFileResult,
  LocalReadFilesParams,
  LocalSearchFilesParams,
  MoveLocalFilesParams,
  OpenLocalFileParams,
  OpenLocalFolderParams,
  RenameLocalFileResult,
  WriteLocalFileParams,
} from '@lobechat/electron-client-ipc';
import { SYSTEM_FILES_TO_IGNORE, loadFile } from '@lobechat/file-loaders';
import { shell } from 'electron';
import * as fs from 'node:fs';
import { rename as renamePromise } from 'node:fs/promises';
import * as path from 'node:path';
import { promisify } from 'node:util';

import FileSearchService from '@/services/fileSearchSrv';
import { FileResult, SearchOptions } from '@/types/fileSearch';
import { makeSureDirExist } from '@/utils/file-system';
import { createLogger } from '@/utils/logger';

import { ControllerModule, ipcClientEvent } from './index';

// 创建日志记录器
const logger = createLogger('controllers:LocalFileCtr');

const statPromise = promisify(fs.stat);
const readdirPromise = promisify(fs.readdir);
const renamePromiseFs = promisify(fs.rename);
const accessPromise = promisify(fs.access);
const writeFilePromise = promisify(fs.writeFile);

export default class LocalFileCtr extends ControllerModule {
  private get searchService() {
    return this.app.getService(FileSearchService);
  }

  /**
   * Handle IPC event for local file search
   */
  @ipcClientEvent('searchLocalFiles')
  async handleLocalFilesSearch(params: LocalSearchFilesParams): Promise<FileResult[]> {
    logger.debug('接收到文件搜索请求:', { keywords: params.keywords });

    const options: Omit<SearchOptions, 'keywords'> = {
      limit: 30,
    };

    try {
      const results = await this.searchService.search(params.keywords, options);
      logger.debug('文件搜索完成', { count: results.length });
      return results;
    } catch (error) {
      logger.error('文件搜索失败:', error);
      return [];
    }
  }

  @ipcClientEvent('openLocalFile')
  async handleOpenLocalFile({ path: filePath }: OpenLocalFileParams): Promise<{
    error?: string;
    success: boolean;
  }> {
    logger.debug('尝试打开文件:', { filePath });

    try {
      await shell.openPath(filePath);
      logger.debug('文件打开成功:', { filePath });
      return { success: true };
    } catch (error) {
      logger.error(`打开文件失败 ${filePath}:`, error);
      return { error: (error as Error).message, success: false };
    }
  }

  @ipcClientEvent('openLocalFolder')
  async handleOpenLocalFolder({ path: targetPath, isDirectory }: OpenLocalFolderParams): Promise<{
    error?: string;
    success: boolean;
  }> {
    const folderPath = isDirectory ? targetPath : path.dirname(targetPath);
    logger.debug('尝试打开文件夹:', { folderPath, isDirectory, targetPath });

    try {
      await shell.openPath(folderPath);
      logger.debug('文件夹打开成功:', { folderPath });
      return { success: true };
    } catch (error) {
      logger.error(`打开文件夹失败 ${folderPath}:`, error);
      return { error: (error as Error).message, success: false };
    }
  }

  @ipcClientEvent('readLocalFiles')
  async readFiles({ paths }: LocalReadFilesParams): Promise<LocalReadFileResult[]> {
    logger.debug('开始批量读取文件:', { count: paths.length });

    const results: LocalReadFileResult[] = [];

    for (const filePath of paths) {
      // 初始化结果对象
      logger.debug('读取单个文件:', { filePath });
      const result = await this.readFile({ path: filePath });
      results.push(result);
    }

    logger.debug('批量文件读取完成', { count: results.length });
    return results;
  }

  @ipcClientEvent('readLocalFile')
  async readFile({ path: filePath, loc }: LocalReadFileParams): Promise<LocalReadFileResult> {
    const effectiveLoc = loc ?? [0, 200];
    logger.debug('开始读取文件:', { filePath, loc: effectiveLoc });

    try {
      const fileDocument = await loadFile(filePath);

      const [startLine, endLine] = effectiveLoc;
      const lines = fileDocument.content.split('\n');
      const totalLineCount = lines.length;
      const totalCharCount = fileDocument.content.length;

      // Adjust slice indices to be 0-based and inclusive/exclusive
      const selectedLines = lines.slice(startLine, endLine);
      const content = selectedLines.join('\n');
      const charCount = content.length;
      const lineCount = selectedLines.length;

      logger.debug('文件读取成功:', {
        filePath,
        selectedLineCount: lineCount,
        totalCharCount,
        totalLineCount,
      });

      const result: LocalReadFileResult = {
        // Char count for the selected range
        charCount,
        // Content for the selected range
        content,
        createdTime: fileDocument.createdTime,
        fileType: fileDocument.fileType,
        filename: fileDocument.filename,
        lineCount,
        loc: effectiveLoc,
        // Line count for the selected range
        modifiedTime: fileDocument.modifiedTime,

        // Total char count of the file
        totalCharCount,
        // Total line count of the file
        totalLineCount,
      };

      try {
        const stats = await statPromise(filePath);
        if (stats.isDirectory()) {
          logger.warn('尝试读取目录内容:', { filePath });
          result.content = 'This is a directory and cannot be read as plain text.';
          result.charCount = 0;
          result.lineCount = 0;
          // Keep total counts for directory as 0 as well, or decide if they should reflect metadata size
          result.totalCharCount = 0;
          result.totalLineCount = 0;
        }
      } catch (statError) {
        logger.error(`获取文件状态失败 ${filePath}:`, statError);
      }

      return result;
    } catch (error) {
      logger.error(`读取文件失败 ${filePath}:`, error);
      const errorMessage = (error as Error).message;
      return {
        charCount: 0,
        content: `Error accessing or processing file: ${errorMessage}`,
        createdTime: new Date(),
        fileType: path.extname(filePath).toLowerCase().replace('.', '') || 'unknown',
        filename: path.basename(filePath),
        lineCount: 0,
        loc: [0, 0],
        modifiedTime: new Date(),
        totalCharCount: 0, // Add total counts to error result
        totalLineCount: 0,
      };
    }
  }

  @ipcClientEvent('listLocalFiles')
  async listLocalFiles({ path: dirPath }: ListLocalFileParams): Promise<FileResult[]> {
    logger.debug('列出目录内容:', { dirPath });

    const results: FileResult[] = [];
    try {
      const entries = await readdirPromise(dirPath);
      logger.debug('目录项获取成功:', { dirPath, entriesCount: entries.length });

      for (const entry of entries) {
        // Skip specific system files based on the ignore list
        if (SYSTEM_FILES_TO_IGNORE.includes(entry)) {
          logger.debug('忽略系统文件:', { fileName: entry });
          continue;
        }

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
          logger.error(`获取文件状态失败 ${fullPath}:`, statError);
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

      logger.debug('目录列表获取成功', { dirPath, resultCount: results.length });
      return results;
    } catch (error) {
      logger.error(`列出目录失败 ${dirPath}:`, error);
      // Rethrow or return an empty array/error object depending on desired behavior
      // For now, returning empty array on error listing directory itself
      return [];
    }
  }

  @ipcClientEvent('moveLocalFiles')
  async handleMoveFiles({ items }: MoveLocalFilesParams): Promise<LocalMoveFilesResultItem[]> {
    logger.debug('开始批量移动文件:', { itemsCount: items?.length });

    const results: LocalMoveFilesResultItem[] = [];

    if (!items || items.length === 0) {
      logger.warn('moveLocalFiles 被调用但参数为空');
      return [];
    }

    // 逐个处理移动请求
    for (const item of items) {
      const { oldPath: sourcePath, newPath } = item;
      const logPrefix = `[移动文件 ${sourcePath} -> ${newPath}]`;
      logger.debug(`${logPrefix} 开始处理`);

      const resultItem: LocalMoveFilesResultItem = {
        newPath: undefined,
        sourcePath,
        success: false,
      };

      // 基本验证
      if (!sourcePath || !newPath) {
        logger.error(`${logPrefix} 参数验证失败: 源路径或目标路径为空`);
        resultItem.error = 'Both oldPath and newPath are required for each item.';
        results.push(resultItem);
        continue;
      }

      try {
        // 检查源是否存在
        try {
          await accessPromise(sourcePath, fs.constants.F_OK);
          logger.debug(`${logPrefix} 源文件存在`);
        } catch (accessError: any) {
          if (accessError.code === 'ENOENT') {
            logger.error(`${logPrefix} 源文件不存在`);
            throw new Error(`Source path not found: ${sourcePath}`);
          } else {
            logger.error(`${logPrefix} 访问源文件权限错误:`, accessError);
            throw new Error(
              `Permission denied accessing source path: ${sourcePath}. ${accessError.message}`,
            );
          }
        }

        // 检查目标路径是否与源路径相同
        if (path.normalize(sourcePath) === path.normalize(newPath)) {
          logger.info(`${logPrefix} 源路径和目标路径相同，跳过移动`);
          resultItem.success = true;
          resultItem.newPath = newPath; // 即使未移动，也报告目标路径
          results.push(resultItem);
          continue;
        }

        // LBYL: 确保目标目录存在
        const targetDir = path.dirname(newPath);
        makeSureDirExist(targetDir);
        logger.debug(`${logPrefix} 已确保目标目录存在: ${targetDir}`);

        // 执行移动 (rename)
        await renamePromiseFs(sourcePath, newPath);
        resultItem.success = true;
        resultItem.newPath = newPath;
        logger.info(`${logPrefix} 移动成功`);
      } catch (error) {
        logger.error(`${logPrefix} 移动失败:`, error);
        // 使用与 handleMoveFile 类似的错误处理逻辑
        let errorMessage = (error as Error).message;
        if ((error as any).code === 'ENOENT')
          errorMessage = `Source path not found: ${sourcePath}.`;
        else if ((error as any).code === 'EPERM' || (error as any).code === 'EACCES')
          errorMessage = `Permission denied to move the item at ${sourcePath}. Check file/folder permissions.`;
        else if ((error as any).code === 'EBUSY')
          errorMessage = `The file or directory at ${sourcePath} or ${newPath} is busy or locked by another process.`;
        else if ((error as any).code === 'EXDEV')
          errorMessage = `Cannot move across different file systems or drives. Source: ${sourcePath}, Target: ${newPath}.`;
        else if ((error as any).code === 'EISDIR')
          errorMessage = `Cannot overwrite a directory with a file, or vice versa. Source: ${sourcePath}, Target: ${newPath}.`;
        else if ((error as any).code === 'ENOTEMPTY')
          errorMessage = `The target directory ${newPath} is not empty (relevant on some systems if target exists and is a directory).`;
        else if ((error as any).code === 'EEXIST')
          errorMessage = `An item already exists at the target path: ${newPath}.`;
        // 保留来自访问检查或目录检查的更具体错误
        else if (
          !errorMessage.startsWith('Source path not found') &&
          !errorMessage.startsWith('Permission denied accessing source path') &&
          !errorMessage.includes('Target directory')
        ) {
          // Keep the original error message if none of the specific codes match
        }
        resultItem.error = errorMessage;
      }
      results.push(resultItem);
    }

    logger.debug('批量移动文件完成', {
      总数量: results.length,
      成功数量: results.filter((r) => r.success).length,
    });
    return results;
  }

  @ipcClientEvent('renameLocalFile')
  async handleRenameFile({
    path: currentPath,
    newName,
  }: {
    newName: string;
    path: string;
  }): Promise<RenameLocalFileResult> {
    const logPrefix = `[重命名 ${currentPath} -> ${newName}]`;
    logger.debug(`${logPrefix} 开始处理重命名请求`);

    // Basic validation (can also be done in frontend action)
    if (!currentPath || !newName) {
      logger.error(`${logPrefix} 参数验证失败: 路径或新名称为空`);
      return { error: 'Both path and newName are required.', newPath: '', success: false };
    }
    // Prevent path traversal or using invalid characters/names
    if (
      newName.includes('/') ||
      newName.includes('\\') ||
      newName === '.' ||
      newName === '..' ||
      /["*/:<>?\\|]/.test(newName) // Check for typical invalid filename characters
    ) {
      logger.error(`${logPrefix} 新文件名包含非法字符: ${newName}`);
      return {
        error:
          'Invalid new name. It cannot contain path separators (/, \\), be "." or "..", or include characters like < > : " / \\ | ? *.',
        newPath: '',
        success: false,
      };
    }

    let newPath: string;
    try {
      const dir = path.dirname(currentPath);
      newPath = path.join(dir, newName);
      logger.debug(`${logPrefix} 计算得到的新路径: ${newPath}`);

      // Check if paths are identical after calculation
      if (path.normalize(currentPath) === path.normalize(newPath)) {
        logger.info(`${logPrefix} 源路径和计算得到的目标路径相同，跳过重命名`);
        // Consider success as no change is needed, but maybe inform the user?
        // Return success for now.
        return { newPath, success: true };
      }
    } catch (error) {
      logger.error(`${logPrefix} 计算新路径失败:`, error);
      return {
        error: `Internal error calculating the new path: ${(error as Error).message}`,
        newPath: '',
        success: false,
      };
    }

    // Perform the rename operation using fs.promises.rename directly
    try {
      await renamePromise(currentPath, newPath);
      logger.info(`${logPrefix} 重命名成功: ${currentPath} -> ${newPath}`);
      // Optionally return the newPath if frontend needs it
      // return { success: true, newPath: newPath };
      return { newPath, success: true };
    } catch (error) {
      logger.error(`${logPrefix} 重命名失败:`, error);
      let errorMessage = (error as Error).message;
      // Provide more specific error messages based on common codes
      if ((error as any).code === 'ENOENT') {
        errorMessage = `File or directory not found at the original path: ${currentPath}.`;
      } else if ((error as any).code === 'EPERM' || (error as any).code === 'EACCES') {
        errorMessage = `Permission denied to rename the item at ${currentPath}. Check file/folder permissions.`;
      } else if ((error as any).code === 'EBUSY') {
        errorMessage = `The file or directory at ${currentPath} or ${newPath} is busy or locked by another process.`;
      } else if ((error as any).code === 'EISDIR' || (error as any).code === 'ENOTDIR') {
        errorMessage = `Cannot rename - conflict between file and directory. Source: ${currentPath}, Target: ${newPath}.`;
      } else if ((error as any).code === 'EEXIST') {
        // Target already exists
        errorMessage = `Cannot rename: an item with the name '${newName}' already exists at this location.`;
      }
      // Add more specific checks as needed
      return { error: errorMessage, newPath: '', success: false };
    }
  }

  @ipcClientEvent('writeLocalFile')
  async handleWriteFile({ path: filePath, content }: WriteLocalFileParams) {
    const logPrefix = `[写入文件 ${filePath}]`;
    logger.debug(`${logPrefix} 开始写入文件`, { contentLength: content?.length });

    // 验证参数
    if (!filePath) {
      logger.error(`${logPrefix} 参数验证失败: 路径为空`);
      return { error: '路径不能为空', success: false };
    }

    if (content === undefined) {
      logger.error(`${logPrefix} 参数验证失败: 内容为空`);
      return { error: '内容不能为空', success: false };
    }

    try {
      // 确保目标目录存在
      const dirname = path.dirname(filePath);
      logger.debug(`${logPrefix} 创建目录: ${dirname}`);
      fs.mkdirSync(dirname, { recursive: true });

      // 写入文件内容
      logger.debug(`${logPrefix} 开始写入内容到文件`);
      await writeFilePromise(filePath, content, 'utf8');
      logger.info(`${logPrefix} 写入文件成功`, { path: filePath, size: content.length });

      return { success: true };
    } catch (error) {
      logger.error(`${logPrefix} 写入文件失败:`, error);
      return {
        error: `写入文件失败: ${(error as Error).message}`,
        success: false,
      };
    }
  }
}
