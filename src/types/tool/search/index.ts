export interface SearchParams {
  searchCategories?: string[];
  searchEngines?: string[];
  searchTimeRange?: string;
}

export interface SearchQuery extends SearchParams {
  query: string;
}

export const SEARCH_SEARXNG_NOT_CONFIG = 'SearXNG is not configured';

export interface SearchContent {
  content?: string;
  img_src?: string;
  publishedDate?: string | null;
  thumbnail?: string | null;
  title: string;
  url: string;
}

export interface UniformSearchResult {
  category?: string;
  content: string;
  engines: string[];
  /**
   * 视频会用到
   */
  iframeSrc?: string;
  imgSrc?: string;
  parsedUrl: string;
  publishedDate?: string;
  score: number;
  thumbnail?: string;
  title: string;
  url: string;
}

export interface UniformSearchResponse {
  costTime: number;
  query: string;
  resultNumbers: number;
  results: UniformSearchResult[];
}
