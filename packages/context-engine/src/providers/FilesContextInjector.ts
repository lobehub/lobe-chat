import debug from 'debug';

import { BaseProvider } from '../base/BaseProvider';
import type { PipelineContext, ProcessorOptions } from '../types';

/**
 * 文件上下文注入器
 * 负责为包含文件的消息注入文件上下文信息
 */
export class FilesContextInjector extends BaseProvider {
  readonly name = 'FilesContextInjector';

  private readonly log = debug('context-engine:provider:FilesContextInjector');

  constructor(
    private fileContextOptions: {
      addUrl?: boolean;
      includeMetadata?: boolean;
      maxFileSize?: number;
    } = {},
    options: ProcessorOptions = {},
  ) {
    super(options);
  }

  protected async doProcess(context: PipelineContext): Promise<PipelineContext> {
    const clonedContext = this.cloneContext(context);

    let processedCount = 0;
    let totalFilesProcessed = 0;

    // 处理每条消息的文件上下文
    clonedContext.messages = clonedContext.messages.map((message) => {
      const hasFiles =
        (message.fileList && message.fileList.length > 0) ||
        (message.imageList && message.imageList.length > 0);

      if (!hasFiles) {
        return message;
      }

      try {
        const fileContext = this.buildFileContext(message);

        if (fileContext.trim()) {
          processedCount++;
          totalFilesProcessed += (message.fileList?.length || 0) + (message.imageList?.length || 0);

          // 将文件上下文添加到消息内容中
          const updatedContent = this.mergeContentWithFileContext(
            message.content as string,
            fileContext,
          );

          this.log(`Added file context for message ${message.id}`);

          return {
            ...message,
            content: updatedContent,
          };
        }

        return message;
      } catch (error) {
        this.log.extend('error')(`处理消息 ${message.id} 文件上下文时出错: ${error}`);
        return message;
      }
    });

    // 更新元数据
    clonedContext.metadata.filesContextProcessed = processedCount;
    clonedContext.metadata.totalFilesProcessed = totalFilesProcessed;

    this.log(
      `File context processing completed, processed ${processedCount} messages, ${totalFilesProcessed} files`,
    );

    return this.markAsExecuted(clonedContext);
  }

  /**
   * 构建文件上下文信息
   */
  private buildFileContext(message: any): string {
    const contextParts: string[] = [];

    // 处理文件列表
    if (message.fileList && message.fileList.length > 0) {
      contextParts.push(this.buildFileListContext(message.fileList));
    }

    // 处理图像列表
    if (message.imageList && message.imageList.length > 0) {
      contextParts.push(this.buildImageListContext(message.imageList));
    }

    return contextParts.filter(Boolean).join('\n\n');
  }

  /**
   * 构建文件列表上下文
   */
  private buildFileListContext(fileList: string[]): string {
    const fileContexts = fileList.map((fileId, index) => {
      const contextParts = [`文件 ${index + 1}: ${fileId}`];

      if (this.fileContextOptions.addUrl) {
        contextParts.push(`URL: /file/${fileId}`);
      }

      if (this.fileContextOptions.includeMetadata) {
        // 这里可以扩展，从文件存储中获取更多元数据
        contextParts.push('类型: 文档文件');
      }

      return contextParts.join('\n');
    });

    return `相关文件信息:\n${fileContexts.join('\n\n')}`;
  }

  /**
   * 构建图像列表上下文
   */
  private buildImageListContext(imageList: any[]): string {
    const imageContexts = imageList.map((image, index) => {
      const contextParts = [`图像 ${index + 1}`];

      if (image.alt) {
        contextParts.push(`描述: ${image.alt}`);
      }

      if (this.fileContextOptions.addUrl && image.url) {
        contextParts.push(`URL: ${image.url}`);
      }

      if (image.id) {
        contextParts.push(`ID: ${image.id}`);
      }

      return contextParts.join('\n');
    });

    return `相关图像信息:\n${imageContexts.join('\n\n')}`;
  }

  /**
   * 合并内容和文件上下文
   */
  private mergeContentWithFileContext(originalContent: string, fileContext: string): string {
    if (!fileContext.trim()) {
      return originalContent;
    }

    // 将文件上下文添加到消息内容的末尾
    return [originalContent, fileContext].filter(Boolean).join('\n\n').trim();
  }

  // 简化：不提供 set/get，选项通过构造函数一次性传入

  /**
   * 检查消息是否包含文件
   */
  static hasFiles(message: any): boolean {
    return (
      (message.fileList && message.fileList.length > 0) ||
      (message.imageList && message.imageList.length > 0)
    );
  }

  /**
   * 统计消息中的文件数量
   */
  static countFiles(message: any): { files: number; images: number; total: number } {
    const files = message.fileList?.length || 0;
    const images = message.imageList?.length || 0;

    return {
      files,
      images,
      total: files + images,
    };
  }

  /**
   * 预处理文件列表（验证和过滤）
   */
  private preprocessFileList(fileList: string[] = []): string[] {
    return fileList.filter((fileId) => {
      if (!fileId || typeof fileId !== 'string') {
        this.log.extend('warn')(`跳过无效的文件ID: ${fileId}`);
        return false;
      }

      if (this.fileContextOptions.maxFileSize) {
        // 这里可以添加文件大小检查逻辑
        // 需要从文件存储系统获取文件大小
      }

      return true;
    });
  }
}
