/**
 * S3文件服务实现
 */
export interface FileServiceImpl {
  /**
   * 创建预签名上传URL
   */
  createPreSignedUrl(key: string): Promise<string>;

  /**
   * 创建预签名预览URL
   */
  createPreSignedUrlForPreview(key: string, expiresIn?: number): Promise<string>;

  /**
   * 删除文件
   */
  deleteFile(key: string): Promise<any>;

  /**
   * 批量删除文件
   */
  deleteFiles(keys: string[]): Promise<any>;

  /**
   * 获取文件字节数组
   */
  getFileByteArray(key: string): Promise<Uint8Array>;

  /**
   * 获取文件内容
   */
  getFileContent(key: string): Promise<string>;

  /**
   * 获取完整文件URL
   */
  getFullFileUrl(url?: string | null, expiresIn?: number): Promise<string>;

  /**
   * 从完整URL中提取key
   */
  getKeyFromFullUrl(url: string): string;

  /**
   * 上传内容
   */
  uploadContent(path: string, content: string): Promise<any>;

  /**
   * 上传媒体文件
   */
  uploadMedia(key: string, buffer: Buffer): Promise<{ key: string }>;
}
