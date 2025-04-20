import path from 'node:path';

import type { DocumentPage, FileLoaderInterface } from '../../types';
import { type ExtractedFile, extractFiles, parseString } from '../../utils/parser-utils';

/**
 * Represents a loader for PPTX files using extracted utility functions.
 *
 * This loader reads a PPTX file, extracts text content from each slide,
 * and represents each slide as a `DocumentPage`.
 */
export class PptxLoader implements FileLoaderInterface {
  /**
   * Loads pages from the specified PPTX file path.
   *
   * @param filePath The absolute path to the PPTX file.
   * @returns A Promise resolving to an array of `DocumentPage` objects.
   *          If loading or parsing fails, it returns an array containing a single
   *          `DocumentPage` object with error information in its metadata.
   */
  async loadPages(filePath: string): Promise<DocumentPage[]> {
    const sourceFileName = path.basename(filePath);

    try {
      // --- File Extraction Step ---
      const slidesRegex = /ppt\/slides\/slide\d+\.xml/g;
      const slideNumberRegex = /slide(\d+)\.xml/;

      // Extract only slide XML files
      const slideFiles: ExtractedFile[] = await extractFiles(filePath, (fileName) =>
        slidesRegex.test(fileName),
      );

      // --- Validation Step ---
      if (slideFiles.length === 0) {
        console.warn(`No slide XML files found in ${sourceFileName}. May be corrupted or empty.`);
        return [
          this.createErrorPage(
            'No slides found. The PPTX file might be empty, corrupted, or does not contain standard slide XMLs.',
            sourceFileName,
          ),
        ];
      }

      // --- Sorting Step ---
      // Sort files based on the slide number extracted from the path
      slideFiles.sort((a, b) => {
        const matchA = a.path.match(slideNumberRegex);
        const matchB = b.path.match(slideNumberRegex);
        const numA = matchA ? parseInt(matchA[1], 10) : Infinity;
        const numB = matchB ? parseInt(matchB[1], 10) : Infinity;
        return numA - numB;
      });

      // --- Page Creation Step ---
      const pages: DocumentPage[] = slideFiles
        .map((slideFile, index) => {
          try {
            const xmlDoc = parseString(slideFile.content);
            const paragraphNodes = xmlDoc.getElementsByTagName('a:p');

            const slideText = Array.from(paragraphNodes)
              .map((pNode) => {
                const textNodes = pNode.getElementsByTagName('a:t');
                return Array.from(textNodes)
                  .map((tNode) => (tNode.childNodes[0] ? tNode.childNodes[0].nodeValue : ''))
                  .join(''); // Join text within a paragraph without spaces
              })
              .filter((text) => text.length > 0) // Filter out empty paragraphs
              .join('\n'); // Join paragraphs with newline

            const lines = slideText.split('\n');
            const slideNumberMatch = slideFile.path.match(slideNumberRegex);
            const slideNumber = slideNumberMatch ? parseInt(slideNumberMatch[1], 10) : index + 1; // Fallback to index if regex fails

            const metadata = {
              pageCount: slideFiles.length, // Total number of slides found
              slideNumber: slideNumber,
              sourceFileName,
            };

            return {
              charCount: slideText.length,
              lineCount: lines.length,
              metadata: metadata,
              pageContent: slideText.trim(), // Trim final content
            };
          } catch (parseError) {
            console.error(
              `Failed to parse XML for slide ${slideFile.path} in ${sourceFileName}: ${parseError instanceof Error ? parseError.message : String(parseError)}`,
            );
            // Create a specific error page for this slide, or could return null and filter later
            // Returning null might be better if one slide fails but others succeed.
            // For now, let's keep it simple and create an error page for this slide.
            return this.createErrorPage(
              `Error parsing slide ${slideFile.path}: ${parseError instanceof Error ? parseError.message : String(parseError)}`,
              sourceFileName,
              slideFile.path,
            );
          }
        })
        // Filter out any potential nulls if we change the error handling above
        .filter((page): page is DocumentPage => page !== null);

      if (pages.length === 0) {
        // This case might happen if all slides failed to parse
        console.warn(`Parsing resulted in zero valid pages for ${sourceFileName}`);
        return [this.createErrorPage('Parsing resulted in zero valid pages.', sourceFileName)];
      }

      // Check if all pages are error pages
      const allErrored = pages.every((page) => page.metadata?.error);
      if (allErrored) {
        // If all pages resulted in errors, perhaps return a single summary error
        console.warn(`All slides failed to parse for ${sourceFileName}`);
        return [this.createErrorPage('All slides failed to parse correctly.', sourceFileName)];
        // Or return all the individual error pages: return pages;
      }

      return pages;
    } catch (error) {
      // --- Error Handling Step ---
      // This catches errors from extractFiles or other unexpected issues
      const errorMessage = `Failed to load or process PPTX file: ${error instanceof Error ? error.message : String(error)}`;
      console.error(errorMessage, { filePath });
      return [this.createErrorPage(errorMessage, sourceFileName)];
    }
  }

  /**
   * Aggregates the content from all DocumentPages (slides).
   *
   * Prepends each slide's content with a "## Slide: N" header.
   * Joins the content of slides with a standard separator.
   *
   * @param pages An array of `DocumentPage` objects obtained from `loadPages`.
   * @returns A Promise resolving to the aggregated content string.
   */
  async aggregateContent(pages: DocumentPage[]): Promise<string> {
    // Ensure pages array is valid and non-empty before proceeding
    // Filter out error pages before aggregation unless we want to include error messages
    const validPages = pages.filter((page) => !page.metadata?.error);

    if (validPages.length === 0) {
      // If only error pages existed, return empty or a summary error message
      return pages[0]?.pageContent || ''; // Return content of the first page (might be an error page)
    }

    return validPages
      .map((page) => {
        const slideNumber = page.metadata?.slideNumber;
        // Use Markdown H2 for slide headers
        const header = slideNumber ? `<slide_page pageNumber="${slideNumber}">` : '<slide_page>'; // Fallback header
        return `${header}
${page.pageContent}
</slide_page>`;
      })
      .join('\n\n'); // Use Markdown horizontal rule as separator
  }

  /**
   * Helper method to create a standardized error page object.
   *
   * @param errorInfo A string describing the error.
   * @param sourceFileName The name of the file that caused the error.
   * @param sourceFilePath Optional: Specific path within the archive that caused the error (e.g., slide path)
   * @returns A `DocumentPage` object representing the error state.
   */
  private createErrorPage(
    errorInfo: string,
    sourceFileName: string,
    sourceFilePath?: string,
  ): DocumentPage {
    return {
      charCount: 0,
      lineCount: 0,
      metadata: {
        error: errorInfo,
        pageCount: 0,
        sourceFileName: sourceFileName,
        ...(sourceFilePath && { sourceFilePath }), // Add specific path if available
      },
      pageContent: '', // Error pages have no content
    };
  }
}
