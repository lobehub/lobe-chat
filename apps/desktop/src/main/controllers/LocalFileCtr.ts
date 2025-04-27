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

import { ControllerModule, ipcClientEvent } from './index';

const statPromise = promisify(fs.stat);
const readdirPromise = promisify(fs.readdir);
const renamePromiseFs = promisify(fs.rename);
const accessPromise = promisify(fs.access);

export default class LocalFileCtr extends ControllerModule {
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
  async readFile({ path: filePath, loc }: LocalReadFileParams): Promise<LocalReadFileResult> {
    try {
      const effectiveLoc = loc ?? [0, 200];

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
          result.content = 'This is a directory and cannot be read as plain text.';
          result.charCount = 0;
          result.lineCount = 0;
          // Keep total counts for directory as 0 as well, or decide if they should reflect metadata size
          result.totalCharCount = 0;
          result.totalLineCount = 0;
        }
      } catch (statError) {
        console.error(`Stat failed for ${filePath} after loadFile:`, statError);
      }

      return result;
    } catch (error) {
      console.error(`Error processing file ${filePath}:`, error);
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
    const results: FileResult[] = [];
    try {
      const entries = await readdirPromise(dirPath);

      for (const entry of entries) {
        // Skip specific system files based on the ignore list
        if (SYSTEM_FILES_TO_IGNORE.includes(entry)) {
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

  @ipcClientEvent('moveLocalFiles')
  async handleMoveFiles({ items }: MoveLocalFilesParams): Promise<LocalMoveFilesResultItem[]> {
    const results: LocalMoveFilesResultItem[] = [];

    if (!items || items.length === 0) {
      console.warn('moveLocalFiles called with empty items array.');
      return [];
    }

    // 逐个处理移动请求
    for (const item of items) {
      const { oldPath: sourcePath, newPath } = item;
      const resultItem: LocalMoveFilesResultItem = {
        newPath: undefined,
        sourcePath,
        success: false,
      };

      // 基本验证
      if (!sourcePath || !newPath) {
        resultItem.error = 'Both oldPath and newPath are required for each item.';
        results.push(resultItem);
        continue;
      }

      try {
        // 检查源是否存在
        try {
          await accessPromise(sourcePath, fs.constants.F_OK);
        } catch (accessError: any) {
          if (accessError.code === 'ENOENT') {
            throw new Error(`Source path not found: ${sourcePath}`);
          } else {
            throw new Error(
              `Permission denied accessing source path: ${sourcePath}. ${accessError.message}`,
            );
          }
        }

        // 检查目标路径是否与源路径相同
        if (path.normalize(sourcePath) === path.normalize(newPath)) {
          console.log(`Skipping move: source and target path are identical: ${sourcePath}`);
          resultItem.success = true;
          resultItem.newPath = newPath; // 即使未移动，也报告目标路径
          results.push(resultItem);
          continue;
        }

        // LBYL: 确保目标目录存在
        const targetDir = path.dirname(newPath);
        makeSureDirExist(targetDir);

        // 执行移动 (rename)
        await renamePromiseFs(sourcePath, newPath);
        resultItem.success = true;
        resultItem.newPath = newPath;
        console.log(`Successfully moved ${sourcePath} to ${newPath}`);
      } catch (error) {
        console.error(`Error moving ${sourcePath} to ${newPath}:`, error);
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
    // Basic validation (can also be done in frontend action)
    if (!currentPath || !newName) {
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

      // Check if paths are identical after calculation
      if (path.normalize(currentPath) === path.normalize(newPath)) {
        console.log(
          `Skipping rename: oldPath and calculated newPath are identical: ${currentPath}`,
        );
        // Consider success as no change is needed, but maybe inform the user?
        // Return success for now.
        return { newPath, success: true };
      }
    } catch (error) {
      console.error(`Error calculating new path for rename ${currentPath} to ${newName}:`, error);
      return {
        error: `Internal error calculating the new path: ${(error as Error).message}`,
        newPath: '',
        success: false,
      };
    }

    // Perform the rename operation using fs.promises.rename directly
    try {
      await renamePromise(currentPath, newPath);
      console.log(`Successfully renamed ${currentPath} to ${newPath}`);
      // Optionally return the newPath if frontend needs it
      // return { success: true, newPath: newPath };
      return { newPath, success: true };
    } catch (error) {
      console.error(`Error renaming ${currentPath} to ${newPath}:`, error);
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
}
