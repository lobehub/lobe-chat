import { stat } from 'node:fs/promises';
import * as path from 'node:path';

import { fileLoaders } from './loaders';
import { TextLoader } from './loaders/text';
import { FileDocument, FileMetadata, SupportedFileType } from './types';
import type { DocumentPage, FileLoaderInterface } from './types';
import { isTextReadableFile } from './utils/isTextReadableFile';

/**
 * Determines the file type based on the filename extension.
 * @param filePath The path to the file.
 * @returns The determined file type or 'txt' if text-readable, undefined otherwise.
 */
const getFileType = (filePath: string): SupportedFileType | undefined => {
  const extension = path.extname(filePath).toLowerCase().replace('.', '');

  if (!extension) return 'txt'; // Treat files without extension as text?

  // Prioritize checking if it's a generally text-readable type
  if (isTextReadableFile(extension)) {
    return 'txt';
  }

  // Handle specific non-text or complex types
  switch (extension) {
    case 'pdf': {
      return 'pdf';
    }
    case 'docx': {
      return 'docx';
    }
    case 'xlsx':
    case 'xls': {
      return 'excel';
    }
    case 'pptx': {
      return 'pptx';
    }
    default: {
      // If not text-readable and not a specific known type, it's unsupported
      return undefined;
    }
  }
};

// Default fallback loader class
const DefaultLoader = TextLoader;

/**
 * Loads a file from the specified path, automatically detecting the file type
 * and using the appropriate loader class.
 *
 * @param filePath The path to the file to load.
 * @param fileMetadata Optional metadata to override information read from the filesystem.
 * @returns A Promise resolving to a FileDocument object.
 */
export const loadFile = async (
  filePath: string,
  fileMetadata?: FileMetadata,
): Promise<FileDocument> => {
  let stats;
  let fsError: string | undefined;

  try {
    stats = await stat(filePath);
  } catch (e) {
    const error = e as Error;
    console.error(`Error getting file stats for ${filePath}: ${error.message}`);
    fsError = `Failed to access file stats: ${error.message}`;
  }

  // Determine base file info from path and stats (if available)
  const fileExtension = path.extname(filePath).slice(1).toLowerCase();
  const baseFilename = path.basename(filePath);

  // Apply overrides from fileMetadata or use defaults
  const source = fileMetadata?.source ?? filePath;
  const filename = fileMetadata?.filename ?? baseFilename;
  const fileType = fileMetadata?.fileType ?? fileExtension;
  const createdTime = fileMetadata?.createdTime ?? stats?.ctime ?? new Date();
  const modifiedTime = fileMetadata?.modifiedTime ?? stats?.mtime ?? new Date();

  const paserType = getFileType(filePath);

  // Select the loader CLASS based on the determined fileType, fallback to DefaultLoader
  const LoaderClass: new () => FileLoaderInterface = paserType
    ? fileLoaders[paserType]
    : DefaultLoader;

  if (!paserType) {
    console.warn(
      `No specific loader found for file type '${fileType}'. Using default loader (${DefaultLoader.name}) as fallback.`,
    );
  }

  let pages: DocumentPage[] = [];
  let aggregatedContent = '';
  let loaderError: string | undefined;
  let aggregationError: string | undefined;
  let metadataError: string | undefined;
  let loaderSpecificMetadata: any | undefined;

  // Instantiate the loader
  const loaderInstance = new LoaderClass();

  // If we couldn't even get stats, skip loader execution
  if (!fsError) {
    try {
      // 1. Load pages using the instance
      pages = await loaderInstance.loadPages(filePath);

      try {
        // 2. Aggregate content using the instance
        aggregatedContent = await loaderInstance.aggregateContent(pages);
      } catch (aggError) {
        const error = aggError as Error;
        console.error(
          `Error aggregating content for ${filePath} using ${LoaderClass.name}: ${error.message}`,
        );
        aggregationError = `Content aggregation failed: ${error.message}`;
        // Keep the pages loaded, but content might be empty/incomplete
      }

      // 3. Attach document-specific metadata if loader supports it
      if (typeof loaderInstance.attachDocumentMetadata === 'function') {
        try {
          loaderSpecificMetadata = await loaderInstance.attachDocumentMetadata(filePath);
        } catch (metaErr) {
          const error = metaErr as Error;
          console.error(
            `Error attaching metadata for ${filePath} using ${LoaderClass.name}: ${error.message}`,
          );
          metadataError = `Metadata attachment failed: ${error.message}`;
        }
      }
    } catch (loadErr) {
      const error = loadErr as Error;
      console.error(
        `Error loading pages for ${filePath} using ${LoaderClass.name}: ${error.message}`,
      );
      loaderError = `Loader execution failed: ${error.message}`;
      // Provide a minimal error page if loader failed critically
      pages = [
        {
          charCount: 0,
          lineCount: 0,
          metadata: { error: loaderError },
          pageContent: '',
        },
      ];
      // Aggregated content remains empty
    }
  } else {
    // If stats failed, create a minimal error page
    pages = [
      {
        charCount: 0,
        lineCount: 0,
        metadata: { error: fsError },
        pageContent: '',
      },
    ];
    // Aggregated content remains empty
  }

  // Calculate totals from the loaded pages
  let totalCharCount = 0;
  let totalLineCount = 0;
  for (const page of pages) {
    totalCharCount += page.charCount;
    totalLineCount += page.lineCount;
  }

  // Combine all potential errors
  const combinedError =
    [fsError, loaderError, aggregationError, metadataError].filter(Boolean).join('; ') || undefined;

  // Construct the final FileDocument
  const fileDocument: FileDocument = {
    content: aggregatedContent, // Use content from aggregateContent
    createdTime,
    fileType,
    filename,
    metadata: {
      // Include combined errors
      error: combinedError,
      // Add loader specific metadata under a namespace
      loaderSpecific: loaderSpecificMetadata ?? undefined,
      // Add other file-level metadata
      ...fileMetadata,
    },
    modifiedTime,
    pages, // Use pages from loadPages
    source,
    totalCharCount,
    totalLineCount,
  };

  // Clean up undefined error field if no error occurred
  if (!fileDocument.metadata.error) {
    delete fileDocument.metadata.error;
  }

  return fileDocument;
};
