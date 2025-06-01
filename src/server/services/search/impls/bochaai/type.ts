export interface BoChaAISearchParameters {
  count?: number;
  exclude?: string;
  freshness?: string;
  include?: string;
  query: string;
  summery?: boolean;
}

interface BoChaAIQueryContext {
  originalQuery: string;
}

interface BoChaAIValue {
  cachedPageUrl?: string;
  dateLastCrawled?: string;
  displayUrl?: string;
  id?: string | null;
  isFamilyFriendly?: boolean;
  isNavigational?: boolean;
  language?: string;
  name: string;
  siteName?: string;
  snippet?: string;
  url: string;
}

interface BoChaAIWebPages {
  totalEstimatedMatches?: number;
  value?: BoChaAIValue[];
  webSearchUrl?: string;
}

interface BoChaAIData {
  images?: any;
  queryContext?: BoChaAIQueryContext;
  videos?: any;
  webPages: BoChaAIWebPages;
}

export interface BoChaAIResponse {
  code?: number;
  data: BoChaAIData;
  log_id?: string;
  msg?: string | null;
}
