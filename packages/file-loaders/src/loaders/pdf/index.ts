import { readFile } from 'node:fs/promises';
import * as pdfjsLib from 'pdfjs-dist';
import type { PDFDocumentProxy, PDFPageProxy, TextContent } from 'pdfjs-dist/types/src/display/api';

import type { DocumentPage, FileLoaderInterface } from '../../types';

/**
 * Loads PDF files page by page using the official pdfjs-dist library.
 */
export class PdfLoader implements FileLoaderInterface {
  private pdfInstance: PDFDocumentProxy | null = null;

  private async getPDFFile(filePath: string) {
    if (!!this.pdfInstance) return this.pdfInstance;

    const dataBuffer = await readFile(filePath);

    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(dataBuffer.buffer, dataBuffer.byteOffset, dataBuffer.length),
      useSystemFonts: true,
      // Explicitly disable worker thread
      worker: undefined, // Attempt to use system fonts
    });

    const pdf: PDFDocumentProxy = await loadingTask.promise;

    this.pdfInstance = pdf;

    return pdf;
  }

  async loadPages(filePath: string): Promise<DocumentPage[]> {
    try {
      const pdf: PDFDocumentProxy = await this.getPDFFile(filePath);

      const pages: DocumentPage[] = [];

      for (let i = 1; i <= pdf.numPages; i += 1) {
        const page: PDFPageProxy = await pdf.getPage(i);
        const content: TextContent = await page.getTextContent();

        // --- Revert to EXACT Simple Langchain PDFLoader Logic ---
        let lastY;
        const textItems = [];
        for (const item of content.items) {
          // Ensure 'str' exists and potentially filter empty strings if needed, though Langchain's snippet doesn't explicitly filter empties
          if ('str' in item) {
            if (lastY === item.transform[5] || !lastY) {
              // Exact check from Langchain
              textItems.push(item.str);
            } else {
              // Exact else from Langchain for Y change
              textItems.push(`\n${item.str}`);
            }
            // Update lastY, Langchain's snippet doesn't use destructuring here
            lastY = item.transform[5];
          }
        }

        const pageText = textItems.join(''); // Join with empty separator
        // --- End Revert to Simple Langchain Logic ---

        // Clean the final text (keep null character removal)
        const cleanedPageContent = pageText.replaceAll('\0', '');

        // Calculate stats based on the final content
        const pageLines = cleanedPageContent.split('\n');
        const lineCount = pageLines.length;
        const charCount = cleanedPageContent.length;

        pages.push({
          charCount,
          lineCount,
          metadata: { pageNumber: i },
          pageContent: cleanedPageContent,
        });

        // Clean up page resources
        page.cleanup();
      }

      // Clean up document resources
      await pdf.destroy();

      return pages;
    } catch (e) {
      const error = e as Error;
      console.error(
        `Error loading PDF file ${filePath} using pdfjs-dist: ${error.message}`,
        error.stack,
      );
      const errorPage: DocumentPage = {
        charCount: 0,
        lineCount: 0,
        metadata: {
          error: `Failed to load or parse PDF file: ${error.message}`,
          filePath: filePath,
        },
        pageContent: '',
      };
      return [errorPage];
    }
  }

  /**
   * Aggregates content from PDF pages.
   * Uses double newline as a separator.
   * @param pages Array of DocumentPage objects.
   * @returns Aggregated content as a string.
   */
  async aggregateContent(pages: DocumentPage[]): Promise<string> {
    return pages
      .filter((page) => !page.metadata.error)
      .map((page) => page.pageContent)
      .join('\n\n');
  }

  async attachDocumentMetadata(filePath: string): Promise<any> {
    const pdf: PDFDocumentProxy = await this.getPDFFile(filePath);

    const pdfMetadata = (await pdf.getMetadata().catch(() => null)) ?? null;
    const pdfInfo = pdfMetadata?.info ?? {};
    const metadata = pdfMetadata?.metadata ?? null;

    return {
      pdfInfo: pdfInfo,
      // PDF info (Author, Title, etc.)
      pdfMetadata: metadata,
      // PDF metadata
      pdfVersion: pdfjsLib.version,
    };
  }
}
