export interface SearchQuery {
  optionalParams?: {
    searchCategories?: string[];
    searchEngines?: string[];
    searchTimeRange?: string;
  };
  query: string;
}

export const SEARCH_SEARXNG_NOT_CONFIG = 'SearXNG is not configured';

export interface SearchResponse {
  answers: any[];
  corrections: any[];
  infoboxes: any[];
  number_of_results: number;
  query: string;
  results: SearchResult[];
  suggestions: string[];
  unresponsive_engines: any[];
}

export interface SearchResult {
  category: string;
  content?: string;
  engine: string;
  engines: string[];
  iframe_src?: string;
  img_src?: string;
  parsed_url: string[];
  positions: number[];
  publishedDate?: string | null;
  score: number;
  template: string;
  thumbnail?: string | null;
  thumbnail_src?: string | null;
  title: string;
  url: string;
}

export interface SearchContent {
  content?: string;
  img_src?: string;
  publishedDate?: string | null;
  thumbnail?: string | null;
  title: string;
  url: string;
}
