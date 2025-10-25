import debug from 'debug';
import * as mammoth from 'mammoth';
import * as fs from 'node:fs/promises';

import type { DocumentPage, FileLoaderInterface } from '../../types';

const log = debug('file-loaders:docx');

/**
 * 表示文档中的一个章节结构
 */
interface DocumentSection {
  children: DocumentSection[];
  content: string;
  endLine?: number;
  level: number;
  startLine: number;
  title: string;
}

/**
 * 表示文档的一个逻辑页面
 */
interface LogicalPage {
  content: string;
  lineNumberEnd: number;
  lineNumberStart: number;
  pageNumber: number;
  sectionLevel?: number;
  sectionTitle?: string;
}

/**
 * 优化版本的 Word 文档加载器
 * 支持提取目录结构和按逻辑页面分割
 */
export class DocxLoader implements FileLoaderInterface {
  private readonly MAX_PAGE_LINES = 50; // 每页最大行数
  private readonly MAX_PAGE_CHARS = 2000; // 每页最大字符数

  async loadPages(filePath: string): Promise<DocumentPage[]> {
    log('Loading DOCX file:', filePath);
    try {
      // Read file as buffer
      const buffer = await fs.readFile(filePath);
      log('File buffer read, size:', buffer.length);

      // Extract text with HTML conversion to preserve structure
      const result = await mammoth.convertToHtml({ buffer });
      const htmlContent = result.value;
      log('HTML content extracted, length:', htmlContent.length);

      // Parse HTML to extract structure
      const { sections, plainText } = this.parseHtmlStructure(htmlContent);

      // Generate table of contents
      const toc = this.generateTableOfContents(sections);

      // Split into logical pages
      const logicalPages = this.splitIntoLogicalPages(plainText, sections);

      log('DOCX document processed, sections:', sections.length, 'pages:', logicalPages.length);

      // Convert logical pages to DocumentPage objects
      const pages: DocumentPage[] = logicalPages.map((logicalPage, index) => {
        const lines = logicalPage.content.split('\n');
        const lineCount = lines.length;
        const charCount = logicalPage.content.length;

        const metadata: DocumentPage['metadata'] = {
          lineNumberEnd: logicalPage.lineNumberEnd,
          lineNumberStart: logicalPage.lineNumberStart,
          pageNumber: logicalPage.pageNumber,
        };

        // Add section information if available
        if (logicalPage.sectionTitle) {
          metadata.sectionTitle = logicalPage.sectionTitle;
          metadata.sectionLevel = logicalPage.sectionLevel;
        }

        // Add TOC information for the first page
        if (index === 0 && toc.length > 0) {
          metadata.tableOfContents = toc;
        }

        return {
          charCount,
          lineCount,
          metadata,
          pageContent: logicalPage.content,
        };
      });

      // Handle warnings if any
      if (result.messages.length > 0) {
        const warnings = result.messages.filter((msg) => msg.type === 'warning');
        if (warnings.length > 0) {
          log('Extraction warnings:', warnings.length);
          warnings.forEach((warning) => log('Warning:', warning.message));
        }
      }

      log('DOCX loading completed');
      return pages;
    } catch (e) {
      const error = e as Error;
      log('Error encountered while loading DOCX file');
      console.error(`Error loading DOCX file ${filePath}: ${error.message}`);

      const errorPage: DocumentPage = {
        charCount: 0,
        lineCount: 0,
        metadata: {
          error: `Failed to load DOCX file: ${error.message}`,
        },
        pageContent: '',
      };
      log('Created error page for failed DOCX loading');
      return [errorPage];
    }
  }

  /**
   * 解析 HTML 结构，提取章节和纯文本
   */
  private parseHtmlStructure(html: string): { plainText: string, sections: DocumentSection[]; } {
    const sections: DocumentSection[] = [];
    let currentSection: DocumentSection | null = null;
    const lines: string[] = [];
    let lineNumber = 0;

    // 简单的 HTML 解析来提取标题和内容
    const htmlLines = html.split('\n');

    for (const htmlLine of htmlLines) {
      const trimmedLine = htmlLine.trim();

      // 检测标题 (h1-h6)
      const headingMatch = trimmedLine.match(/<h([1-6])[^>]*>(.*?)<\/h[1-6]>/i);
      if (headingMatch) {
        const level = parseInt(headingMatch[1], 10);
        const title = this.stripHtmlTags(headingMatch[2]).trim();

        // 结束前一个章节
        if (currentSection) {
          currentSection.endLine = lineNumber - 1;
        }

        // 开始新章节
        currentSection = {
          children: [],
          content: '',
          level,
          startLine: lineNumber,
          title,
        };

        sections.push(currentSection);
      }

      // 提取纯文本内容
      const plainTextLine = this.stripHtmlTags(trimmedLine).trim();
      if (plainTextLine) {
        lines.push(plainTextLine);

        // 添加到当前章节
        if (currentSection) {
          currentSection.content += plainTextLine + '\n';
        }

        lineNumber++;
      }
    }

    // 结束最后一个章节
    if (currentSection) {
      currentSection.endLine = lineNumber - 1;
    }

    return {
      plainText: lines.join('\n'),
      sections,
    };
  }

  /**
   * 生成目录结构
   */
  private generateTableOfContents(
    sections: DocumentSection[],
  ): Array<{ level: number, title: string; }> {
    return sections.map((section) => ({
      level: section.level,
      title: section.title,
    }));
  }

  /**
   * 将文档分割成逻辑页面
   */
  private splitIntoLogicalPages(plainText: string, sections: DocumentSection[]): LogicalPage[] {
    const lines = plainText.split('\n');
    const pages: LogicalPage[] = [];
    let currentPage: string[] = [];
    let currentLineNumber = 0;
    let pageNumber = 1;
    let currentSection: DocumentSection | null = null;

    for (const [i, line] of lines.entries()) {

      // 检查是否进入新章节
      const sectionForLine = sections.find((s) => s.startLine === i);
      if (sectionForLine) {
        currentSection = sectionForLine;

        // 如果当前页不为空，先保存当前页
        if (currentPage.length > 0) {
          pages.push({
            content: currentPage.join('\n'),
            lineNumberEnd: currentLineNumber - 1,
            lineNumberStart: currentLineNumber - currentPage.length,
            pageNumber: pageNumber++,
            sectionLevel: this.getCurrentSectionLevel(currentSection),
            sectionTitle: this.getCurrentSectionTitle(currentSection),
          });
          currentPage = [];
        }
      }

      currentPage.push(line);
      currentLineNumber++;

      // 检查是否需要分页
      const shouldSplitPage =
        currentPage.length >= this.MAX_PAGE_LINES ||
        currentPage.join('\n').length >= this.MAX_PAGE_CHARS;

      if (shouldSplitPage && currentPage.length > 1) {
        pages.push({
          content: currentPage.join('\n'),
          lineNumberEnd: currentLineNumber - 1,
          lineNumberStart: currentLineNumber - currentPage.length,
          pageNumber: pageNumber++,
          sectionLevel: this.getCurrentSectionLevel(currentSection),
          sectionTitle: this.getCurrentSectionTitle(currentSection),
        });
        currentPage = [];
      }
    }

    // 添加最后一页
    if (currentPage.length > 0) {
      pages.push({
        content: currentPage.join('\n'),
        lineNumberEnd: currentLineNumber - 1,
        lineNumberStart: currentLineNumber - currentPage.length,
        pageNumber: pageNumber,
        sectionLevel: this.getCurrentSectionLevel(currentSection),
        sectionTitle: this.getCurrentSectionTitle(currentSection),
      });
    }

    return pages;
  }

  /**
   * 获取当前章节标题
   */
  private getCurrentSectionTitle(section: DocumentSection | null): string | undefined {
    return section?.title;
  }

  /**
   * 获取当前章节层级
   */
  private getCurrentSectionLevel(section: DocumentSection | null): number | undefined {
    return section?.level;
  }

  /**
   * 去除 HTML 标签
   */
  private stripHtmlTags(html: string): string {
    return html.replaceAll(/<[^>]*>/g, '');
  }

  /**
   * Aggregates content from DOCX pages.
   * Uses double newline as a separator.
   * @param pages Array of DocumentPage objects.
   * @returns Aggregated content as a string.
   */
  async aggregateContent(pages: DocumentPage[]): Promise<string> {
    log('Aggregating content from', pages.length, 'DOCX pages');
    const result = pages.map((page) => page.pageContent).join('\n\n');
    log('DOCX content aggregated successfully, length:', result.length);
    return result;
  }
}
