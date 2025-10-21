import { SearchParams, UniformSearchResponse, UniformSearchResult } from '@lobechat/types';
import { TRPCError } from '@trpc/server';
import debug from 'debug';
import urlJoin from 'url-join';

import { SearchServiceImpl } from '../type';
import { FirecrawlResponse, FirecrawlSearchParameters } from './type';

const log = debug('lobe-search:Firecrawl');

const timeRangeMapping = {
  day: 'qdr:d',
  month: 'qdr:m',
  week: 'qdr:w',
  year: 'qdr:y',
};

/**
 * Firecrawl implementation of the search service
 * Primarily used for web crawling
 */
export class FirecrawlImpl implements SearchServiceImpl {
  private get apiKey(): string | undefined {
    return process.env.FIRECRAWL_API_KEY;
  }

  private get baseUrl(): string {
    // Assuming the base URL is consistent with the crawl endpoint
    return process.env.FIRECRAWL_URL || 'https://api.firecrawl.dev/v1';
  }

  async query(query: string, params: SearchParams = {}): Promise<UniformSearchResponse> {
    log('Starting Firecrawl query with query: "%s", params: %o', query, params);
    const endpoint = urlJoin(this.baseUrl, '/search');

    const defaultQueryParams: FirecrawlSearchParameters = {
      limit: 15,
      query,
      /*
      scrapeOptions: {
        formats: ["markdown"]
      },
      */
    };

    let body: FirecrawlSearchParameters = {
      ...defaultQueryParams,
      tbs:
        params?.searchTimeRange && params.searchTimeRange !== 'anytime'
          ? (timeRangeMapping[params.searchTimeRange as keyof typeof timeRangeMapping] ?? undefined)
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
      log.extend('error')('Firecrawl fetch error: %o', error);
      throw new TRPCError({
        cause: error,
        code: 'SERVICE_UNAVAILABLE',
        message: 'Failed to connect to Firecrawl.',
      });
    }

    if (!response.ok) {
      const errorBody = await response.text();
      log.extend('error')(
        `Firecrawl request failed with status ${response.status}: %s`,
        errorBody.length > 200 ? `${errorBody.slice(0, 200)}...` : errorBody,
      );
      throw new TRPCError({
        cause: errorBody,
        code: 'SERVICE_UNAVAILABLE',
        message: `Firecrawl request failed: ${response.statusText}`,
      });
    }

    try {
      const firecrawlResponse = (await response.json()) as FirecrawlResponse;

      log('Parsed Firecrawl response: %o', firecrawlResponse);

      const mappedResults = (firecrawlResponse.data || []).map(
        (result): UniformSearchResult => ({
          category: 'general', // Default category
          content: result.description || '', // Prioritize content, fallback to snippet
          engines: ['firecrawl'], // Use 'firecrawl' as the engine name
          parsedUrl: result.url ? new URL(result.url).hostname : '', // Basic URL parsing
          score: 1, // Default score to 1
          title: result.title || '',
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
      log.extend('error')('Error parsing Firecrawl response: %o', error);
      throw new TRPCError({
        cause: error,
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to parse Firecrawl response.',
      });
    }
  }
}
