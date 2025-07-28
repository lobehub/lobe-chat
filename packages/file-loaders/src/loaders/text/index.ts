import debug from 'debug';
import { readFile } from 'node:fs/promises';

import type { DocumentPage, FileLoaderInterface } from '../../types';

const log = debug('file-loaders:text');

/**
 * 用于加载纯文本文件的加载器。
 */
export class TextLoader implements FileLoaderInterface {
  async loadPages(filePath: string): Promise<DocumentPage[]> {
    log('Loading text file:', filePath);
    try {
      const fileContent = await readFile(filePath, 'utf8');
      log('Text file loaded successfully, size:', fileContent.length, 'bytes');
      const lines = fileContent.split('\n');
      const lineCount = lines.length;
      const charCount = fileContent.length;
      log('Text file stats:', { charCount, lineCount });

      const page: DocumentPage = {
        charCount,
        lineCount,
        metadata: {
          lineNumberEnd: lineCount,
          lineNumberStart: 1,
        },
        pageContent: fileContent,
      };

      log('Text page created successfully');
      return [page];
    } catch (e) {
      const error = e as Error;
      log('Error encountered while loading text file');
      console.error(`Error loading text file ${filePath}: ${error.message}`);
      // 如果读取失败，返回一个包含错误信息的 Page
      const errorPage: DocumentPage = {
        charCount: 0,
        lineCount: 0,
        metadata: {
          error: `Failed to load text file: ${error.message}`,
        },
        pageContent: '',
      };
      log('Created error page for failed text file loading');
      return [errorPage];
    }
  }

  /**
   * 对于纯文本，简单地连接所有页面的内容。
   * （虽然 TextLoader 通常只有一个页面，但保持接口一致性）
   * @param pages 页面数组
   * @returns 聚合后的内容
   */
  async aggregateContent(pages: DocumentPage[]): Promise<string> {
    log('Aggregating content from', pages.length, 'text pages');
    // 默认使用换行符连接，可以根据需要调整或使其可配置
    const result = pages.map((page) => page.pageContent).join('\n');
    log('Content aggregated successfully, length:', result.length);
    return result;
  }
}
