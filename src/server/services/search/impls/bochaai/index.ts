import { TRPCError } from '@trpc/server';
import debug from 'debug';
import urlJoin from 'url-join';

import { SearchParams, UniformSearchResponse, UniformSearchResult } from '@/types/tool/search';

import { SearchServiceImpl } from '../type';
import { BoChaAIResponse } from './type';

interface BoChaAIQueryParams {
  count?: number;
  exclude?: string;
  freshness?: string;
  include?: string;
  query: string;
  summery?: boolean;
}

const log = debug('lobe-search:BoChaAI');

const timeRangeMapping = {
  day: 'oneDay',
  month: 'oneMonth',
  week: 'oneWeek',
  year: 'oneYear',
};

/**
 * BoChaAI implementation of the search service
 * Primarily used for web crawling
 */
export class BoChaAIImpl implements SearchServiceImpl {
  private get apiKey(): string | undefined {
    return process.env.BOCHAAI_API_KEY;
  }

  private get baseUrl(): string {
    // Assuming the base URL is consistent with the crawl endpoint
    return 'https://api.bochaai.com/v1';
  }

  async query(query: string, params: SearchParams = {}): Promise<UniformSearchResponse> {
    log('Starting BoChaAI query with query: "%s", params: %o', query, params);
    const endpoint = urlJoin(this.baseUrl, '/web-search');

    const defaultQueryParams: BoChaAIQueryParams = {
      count: 15,
      query,
    };

    let body: BoChaAIQueryParams = {
      ...defaultQueryParams,
      freshness:
        params?.searchTimeRange && params.searchTimeRange !== 'anytime'
          ? timeRangeMapping[params.searchTimeRange as keyof typeof timeRangeMapping] ?? undefined
          : undefined,
    };

    log('Constructed request body: %o', body);

    let response: Response;
    const startAt = Date.now();
    let costTime = 0;
    try {
      log('Sending request to endpoint: %s', endpoint);
      response = await fetch(endpoint, {
        body: JSON.stringify(body),
        headers: {
          'Authorization': this.apiKey ? `Bearer ${this.apiKey}` : '',
          'Content-Type': 'application/json',
        },
        method: 'POST',
      });
      log('Received response with status: %d', response.status);
      costTime = Date.now() - startAt;
    } catch (error) {
      log.extend('error')('BoChaAI fetch error: %o', error);
      throw new TRPCError({
        cause: error,
        code: 'SERVICE_UNAVAILABLE',
        message: 'Failed to connect to BoChaAI.',
      });
    }

    if (!response.ok) {
      const errorBody = await response.text();
      log.extend('error')(
        `BoChaAI request failed with status ${response.status}: %s`,
        errorBody.length > 200 ? `${errorBody.slice(0, 200)}...` : errorBody,
      );
      throw new TRPCError({
        cause: errorBody,
        code: 'SERVICE_UNAVAILABLE',
        message: `BoChaAI request failed: ${response.statusText}`,
      });
    }

    try {
      const bochaaiResponse = (await response.json()) as BoChaAIResponse;

      log('Parsed BoChaAI response: %o', bochaaiResponse);

      const mappedResults = (bochaaiResponse.data.webPages.value || []).map(
        (result): UniformSearchResult => ({
          category: 'general', // Default category
          content: result.snippet || '', // Prioritize content, fallback to snippet
          engines: ['bochaai'], // Use 'bochaai' as the engine name
          parsedUrl: result.url ? new URL(result.url).hostname : '', // Basic URL parsing
          score: 1, // Default score to 1
          title: result.name || '',
          url: result.url,
        }),
      );

      log('Mapped %d results to SearchResult format', mappedResults.length);

      return {
        costTime,
        query: query,
        resultNumbers: mappedResults.length,
        results: mappedResults,
      };
    } catch (error) {
      log.extend('error')('Error parsing BoChaAI response: %o', error);
      throw new TRPCError({
        cause: error,
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to parse BoChaAI response.',
      });
    }
  }
}
