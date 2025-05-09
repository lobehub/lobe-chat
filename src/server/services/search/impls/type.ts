import { SearchParams, UniformSearchResponse } from '@/types/tool/search';

/**
 * Search service implementation interface
 */
export interface SearchServiceImpl {
  /**
   * Query for search results
   */
  query(query: string, params?: SearchParams): Promise<UniformSearchResponse>;
}
