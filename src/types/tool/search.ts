export interface SearchQuery {
  query: string;
  searchEngines?: string[];
}

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
  parsed_url: string[];
  positions: number[];
  publishedDate?: string | null;
  score: number;
  template: string;
  thumbnail?: string | null;
  title: string;
  url: string;
}

export interface SearchContent {
  content?: string;
  title: string;
  url: string;
}
