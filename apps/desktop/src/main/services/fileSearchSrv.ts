import { FileSearchImpl, createFileSearchModule } from '@/modules/fileSearch';
import { FileResult, SearchOptions } from '@/types/fileSearch';

import { ServiceModule } from './index';

/**
 * File Search Service
 * Main service class that uses platform-specific implementations internally
 */
export default class FileSearchService extends ServiceModule {
  private impl: FileSearchImpl = createFileSearchModule();

  /**
   * Perform file search
   */
  async search(query: string, options: Omit<SearchOptions, 'keywords'> = {}): Promise<FileResult[]> {
    return this.impl.search({ ...options, keywords: query });
  }

  /**
   * Check search service status
   */
  async checkSearchServiceStatus(): Promise<boolean> {
    return this.impl.checkSearchServiceStatus();
  }

  /**
   * Update search index
   * @param path Optional specified path
   * @returns Promise indicating operation success
   */
  async updateSearchIndex(path?: string): Promise<boolean> {
    return this.impl.updateSearchIndex(path);
  }
}
