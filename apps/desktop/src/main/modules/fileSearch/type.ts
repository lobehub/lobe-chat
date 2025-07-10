import { FileResult, SearchOptions } from '@/types/fileSearch';

/**
 * File Search Service Implementation Abstract Class
 * Defines the interface that different platform file search implementations need to implement
 */
export abstract class FileSearchImpl {
  /**
   * Perform file search
   * @param options Search options
   * @returns Promise of search result list
   */
  abstract search(options: SearchOptions): Promise<FileResult[]>;

  /**
   * Check search service status
   * @returns Promise indicating if service is available
   */
  abstract checkSearchServiceStatus(): Promise<boolean>;

  /**
   * Update search index
   * @param path Optional specified path
   * @returns Promise indicating operation success
   */
  abstract updateSearchIndex(path?: string): Promise<boolean>;
}
