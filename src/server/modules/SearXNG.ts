import qs from 'query-string';
import urlJoin from 'url-join';

import { SearchResponse } from '@/types/tool/search';

export class SearXNGClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async search(query: string, engines?: string[]): Promise<SearchResponse> {
    try {
      const searchParams = qs.stringify({
        engines: engines?.join(','),
        format: 'json',
        q: query,
      });

      const response = await fetch(urlJoin(this.baseUrl, `/search?${searchParams}`));

      return await response.json();
    } catch (error) {
      console.error('Error searching:', error);
      throw error;
    }
  }
}
