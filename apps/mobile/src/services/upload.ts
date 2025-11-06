// Use expo-file-system v54 new API
import { Directory, File, Paths } from 'expo-file-system';
import { sha256 } from 'js-sha256';

export interface UploadResult {
  fileType: string;
  filename: string;
  hash: string;
  size: number;
  url: string;
}

/**
 * Mobile upload service using expo-file-system v54 new API
 *
 * 使用 expo-file-system v54 的新 File 和 Directory 类：
 * 1. 图片/视频文件存储在 Paths.document/lobechat-files
 * 2. 使用 SHA256 作为文件名
 * 3. 返回本地文件路径作为 URL
 */

/**
 * File storage in mobile (using expo-file-system v54 new API)
 */
class MobileFileStorage {
  private baseDir: Directory;

  constructor() {
    // 使用 document directory 存储文件
    // 根据 Paths.document 的类型（Directory 对象或字符串）构建路径
    if (Paths.document && typeof Paths.document === 'object' && 'uri' in Paths.document) {
      const docDir = Paths.document as Directory;
      this.baseDir = new Directory(docDir.uri + '/lobechat-files');
    } else if (typeof Paths.document === 'string') {
      this.baseDir = new Directory(Paths.document + '/lobechat-files');
    } else {
      // 降级方案：使用 cache 目录
      const cacheDir =
        typeof Paths.cache === 'string' ? Paths.cache : (Paths.cache as any)?.uri || '/tmp';
      this.baseDir = new Directory(cacheDir + '/lobechat-files');
    }
  }

  /**
   * 确保存储目录存在
   */
  private async ensureDirectoryExists() {
    try {
      if (!this.baseDir.exists) {
        await this.baseDir.create();
      }
    } catch (error) {
      console.error('[MobileFileStorage] Failed to create directory:', error);
      throw error;
    }
  }

  /**
   * 上传文件（复制到本地存储）
   * @param key 文件 hash
   * @param sourceUri 源文件 URI（可以是 file://、content:// 或其他）
   * @param metadata 文件元数据
   */
  async putObject(
    key: string,
    sourceUri: string,
    metadata: { name: string; type: string },
  ): Promise<string> {
    try {
      await this.ensureDirectoryExists();

      const extension = metadata.name.split('.').pop() || 'bin';
      const targetPath = `${this.baseDir.uri}/${key}.${extension}`;
      const targetFile = new File(targetPath);

      // 检查文件是否已存在（对齐 web 端逻辑：hash 相同说明文件内容相同）
      if (targetFile.exists) {
        // 文件已存在，直接返回路径（避免重复复制）
        return targetFile.uri;
      }

      // 文件不存在，进行复制
      const sourceFile = new File(sourceUri);

      if (!sourceFile.exists) {
        throw new Error(`Source file does not exist: ${sourceUri}`);
      }

      await sourceFile.copy(targetFile);

      return targetFile.uri;
    } catch (error) {
      console.error('[MobileFileStorage] putObject error:', error);
      throw new Error(`Failed to put file ${metadata.name}: ${(error as Error).message}`);
    }
  }

  /**
   * 获取文件路径
   * @param key 文件 hash
   * @returns 文件路径
   */
  async getObject(key: string): Promise<string | undefined> {
    try {
      const items = await this.baseDir.list();
      // items 是 File 或 Directory 对象数组，需要通过 name 属性来匹配
      const matchedItem = items.find((item) => item instanceof File && item.name.startsWith(key));

      if (!matchedItem) return undefined;

      return matchedItem.uri;
    } catch (error) {
      console.log(`Failed to get object (key=${key}):`, error);
      return undefined;
    }
  }

  /**
   * 删除文件
   * @param key 文件 hash
   */
  async deleteObject(key: string): Promise<void> {
    try {
      const filePath = await this.getObject(key);
      if (filePath) {
        const file = new File(filePath);
        await file.delete();
      }
    } catch (error) {
      throw new Error(`Failed to delete object (key=${key}): ${(error as Error).message}`);
    }
  }

  /**
   * 读取文件为 base64
   * @param uri 文件 URI
   */
  async readAsBase64(uri: string): Promise<string> {
    const file = new File(uri);
    return await file.base64();
  }
}

export const mobileFileStorage = new MobileFileStorage();

/**
 * Mobile upload service
 */
class MobileUploadService {
  /**
   * Upload file to local storage
   * @param fileUri Local file URI (from ImagePicker or DocumentPicker)
   * @param fileName Original file name
   * @param fileType MIME type
   */
  async uploadFile(
    fileUri: string,
    fileName: string,
    fileType: string,
  ): Promise<{ data: UploadResult; success: boolean }> {
    try {
      // 1. Read file as base64 to calculate hash
      const base64 = await mobileFileStorage.readAsBase64(fileUri);
      const hash = sha256(base64);

      // 2. Get file info
      const sourceFile = new File(fileUri);
      const size = sourceFile.size;

      // 3. Store file locally
      const localPath = await mobileFileStorage.putObject(hash, fileUri, {
        name: fileName,
        type: fileType,
      });

      // 4. Create metadata
      const result: UploadResult = {
        fileType,
        filename: fileName,
        hash,
        size,
        url: localPath,
      };

      return { data: result, success: true };
    } catch (error) {
      console.error('Upload file failed:', error);
      throw error;
    }
  }

  /**
   * Upload base64 image
   * @param base64Data Base64 data URI (with prefix)
   * @param fileName File name
   */
  async uploadBase64(
    base64Data: string,
    fileName: string,
  ): Promise<{ data: UploadResult; success: boolean }> {
    try {
      // 1. Parse base64 data
      const matches = base64Data.match(/^data:(.+);base64,(.+)$/);
      if (!matches) {
        throw new Error('Invalid base64 data');
      }

      const mimeType = matches[1];
      const base64 = matches[2];
      const hash = sha256(base64);

      // 2. Save to temp file
      const extension = mimeType.split('/')[1] || 'png';
      const tempFileName = `${hash}.${extension}`;
      const tempPath = `${Paths.cache}/${tempFileName}`;
      const tempFile = new File(tempPath);

      // Write base64 data to file
      await tempFile.write(base64);

      // 3. Get file size
      const size = tempFile.size;

      // 4. Store permanently
      const localPath = await mobileFileStorage.putObject(hash, tempFile.uri, {
        name: fileName,
        type: mimeType,
      });

      // 5. Clean up temp file
      await tempFile.delete();

      // 6. Create metadata
      const result: UploadResult = {
        fileType: mimeType,
        filename: fileName,
        hash,
        size,
        url: localPath,
      };

      return { data: result, success: true };
    } catch (error) {
      console.error('Upload base64 failed:', error);
      throw error;
    }
  }

  /**
   * Delete file
   * @param hash File hash
   */
  async deleteFile(hash: string): Promise<void> {
    await mobileFileStorage.deleteObject(hash);
  }
}

export const mobileUploadService = new MobileUploadService();
