import { TRPCError } from '@trpc/server';
import debug from 'debug';
import urlJoin from 'url-join';

import { SearchParams, UniformSearchResponse, UniformSearchResult } from '@/types/tool/search';

import { SearchServiceImpl } from '../type';
import { ExaResponse } from './type';

interface ExaQueryParams {
  category?: string;
  endCrawlDate?: string;
  endPublishedDate?: string;
  excludeDomains?: string[];
  excludeText?: string[];
  includeDomains?: string[];
  includeText?: string[];
  numResults?: number;
  query: string;
  startCrawlDate?: string;
  startPublishedDate?: string;
  type?: string;
}

const log = debug('lobe-search:Exa');

/**
 * Exa implementation of the search service
 * Primarily used for web crawling
 */
export class ExaImpl implements SearchServiceImpl {
  private get apiKey(): string | undefined {
    return process.env.EXA_API_KEY;
  }

  private get baseUrl(): string {
    // Assuming the base URL is consistent with the crawl endpoint
    return 'https://api.exa.ai';
  }

  async query(query: string, params: SearchParams = {}): Promise<UniformSearchResponse> {
    log('Starting Exa query with query: "%s", params: %o', query, params);
    const endpoint = urlJoin(this.baseUrl, '/search');

    let body: ExaQueryParams = {
      numResults: 15,
      query,
      type: 'auto',
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
          'x-api-key': this.apiKey ? this.apiKey : '',
          'Content-Type': 'application/json',
        },
        method: 'POST',
      });
      log('Received response with status: %d', response.status);
      costTime = Date.now() - startAt;
    } catch (error) {
      log.extend('error')('Exa fetch error: %o', error);
      throw new TRPCError({
        cause: error,
        code: 'SERVICE_UNAVAILABLE',
        message: 'Failed to connect to Exa.',
      });
    }

    if (!response.ok) {
      const errorBody = await response.text();
      log.extend('error')(
        `Exa request failed with status ${response.status}: %s`,
        errorBody.length > 200 ? `${errorBody.slice(0, 200)}...` : errorBody,
      );
      throw new TRPCError({
        cause: errorBody,
        code: 'SERVICE_UNAVAILABLE',
        message: `Exa request failed: ${response.statusText}`,
      });
    }

    try {
      const exaResponse = (await response.json()) as ExaResponse;

      log('Parsed Exa response: %o', exaResponse);

      const mappedResults = (exaResponse.results || []).map(
        (result): UniformSearchResult => ({
          category: 'general', // Default category
          content: result.text || '', // Prioritize content, fallback to snippet
          engines: ['exa'], // Use 'exa' as the engine name
          parsedUrl: result.url ? new URL(result.url).hostname : '', // Basic URL parsing
          score: result.score || 0, // Default score to 0 if undefined
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
      log.extend('error')('Error parsing Exa response: %o', error);
      throw new TRPCError({
        cause: error,
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to parse Exa response.',
      });
    }
  }
}
