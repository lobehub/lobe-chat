import { DocxLoader as LangchainDocxLoader } from '@langchain/community/document_loaders/fs/docx';

import type { DocumentPage, FileLoaderInterface } from '../../types';

/**
 * Loads Word documents (.docx) using the LangChain Community DocxLoader.
 */
export class DocxLoader implements FileLoaderInterface {
  async loadPages(filePath: string): Promise<DocumentPage[]> {
    try {
      const loader = new LangchainDocxLoader(filePath);
      const docs = await loader.load(); // Langchain DocxLoader typically loads the whole doc as one

      const pages: DocumentPage[] = docs.map((doc) => {
        const pageContent = doc.pageContent || '';
        const lines = pageContent.split('\n');
        const lineCount = lines.length;
        const charCount = pageContent.length;

        // Langchain DocxLoader doesn't usually provide page numbers in metadata
        // We treat it as a single page
        const metadata = {
          ...doc.metadata, // Include any other metadata Langchain provides
          pageNumber: 1,
        };

        // @ts-expect-error Remove source if present, as it's handled at the FileDocument level
        delete metadata.source;

        return {
          charCount,
          lineCount,
          metadata,
          pageContent,
        };
      });

      // If docs array is empty (e.g., empty file), create an empty page
      if (pages.length === 0) {
        pages.push({
          charCount: 0,
          lineCount: 0,
          metadata: { pageNumber: 1 },
          pageContent: '',
        });
      }

      return pages;
    } catch (e) {
      const error = e as Error;
      console.error(`Error loading DOCX file ${filePath} using LangChain loader: ${error.message}`);
      const errorPage: DocumentPage = {
        charCount: 0,
        lineCount: 0,
        metadata: {
          error: `Failed to load DOCX file: ${error.message}`,
        },
        pageContent: '',
      };
      return [errorPage];
    }
  }

  /**
   * Aggregates content from DOCX pages.
   * Uses double newline as a separator.
   * @param pages Array of DocumentPage objects.
   * @returns Aggregated content as a string.
   */
  async aggregateContent(pages: DocumentPage[]): Promise<string> {
    return pages.map((page) => page.pageContent).join('\n\n');
  }
}
