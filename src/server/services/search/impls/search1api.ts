import { TRPCError } from '@trpc/server';

import { SearchResponse } from '@/types/tool/search';

import { SearchServiceImpl } from './type';

/**
 * Search1API implementation of the search service
 * Primarily used for web crawling
 */
export class Search1APIImpl implements SearchServiceImpl {
  async query(): Promise<SearchResponse> {
    throw new TRPCError({
      code: 'NOT_IMPLEMENTED',
      message: 'Search1API implementation does not support querying',
    });
  }
}
