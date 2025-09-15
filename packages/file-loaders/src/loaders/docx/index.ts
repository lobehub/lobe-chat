import { DocxLoader as LangchainDocxLoader } from '@langchain/community/document_loaders/fs/docx';
import debug from 'debug';

import type { DocumentPage, FileLoaderInterface } from '../../types';

const log = debug('file-loaders:docx');

/**
 * Loads Word documents (.docx) using the LangChain Community DocxLoader.
 */
export class DocxLoader implements FileLoaderInterface {
  async loadPages(filePath: string): Promise<DocumentPage[]> {
    log('Loading DOCX file:', filePath);
    try {
      let loader: LangchainDocxLoader;
      if (filePath.endsWith('.doc')) {
        loader = new LangchainDocxLoader(filePath, { type: 'doc' });
      } else {
        loader = new LangchainDocxLoader(filePath, { type: 'docx' });
      }
      log('LangChain DocxLoader created');
      const docs = await loader.load(); // Langchain DocxLoader typically loads the whole doc as one
      log('DOCX document loaded, parts:', docs.length);

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

        log('DOCX document processed, lines:', lineCount, 'chars:', charCount);

        return {
          charCount,
          lineCount,
          metadata,
          pageContent,
        };
      });

      // If docs array is empty (e.g., empty file), create an empty page
      if (pages.length === 0) {
        log('No content in DOCX document, creating empty page');
        pages.push({
          charCount: 0,
          lineCount: 0,
          metadata: { pageNumber: 1 },
          pageContent: '',
        });
      }

      log('DOCX loading completed, total pages:', pages.length);
      return pages;
    } catch (e) {
      const error = e as Error;
      log('Error encountered while loading DOCX file');
      console.error(`Error loading DOCX file ${filePath} using LangChain loader: ${error.message}`);
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
