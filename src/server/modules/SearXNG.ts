import qs from 'query-string';
import urlJoin from 'url-join';

import { SearchResponse } from '@/types/tool/search';

export class SearXNGClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async search(query: string, engines?: string[], time_range?: string): Promise<SearchResponse> {
    try {
      const searchParams = qs.stringify({
        engines: engines?.join(','),
        format: 'json',
        q: query,
        ...( time_range !== 'anytime' ? { time_range: time_range } : {} ),
      });

      const response = await fetch(urlJoin(this.baseUrl, `/search?${searchParams}`));

      if (response.ok) {
        return await response.json();
      }

      throw new Error(`Failed to search: ${response.statusText}`);
    } catch (error) {
      console.error('Error searching:', error);
      throw error;
    }
  }
}
