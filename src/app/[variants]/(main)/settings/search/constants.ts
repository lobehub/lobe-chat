import { CrawlProvider, SearchProvider } from './types';

export const searchProviders: SearchProvider[] = [
  {
    description: 'AI search engine focused on research and analysis',
    id: 'tavily',
    name: 'Tavily',
  },
  { description: 'Web crawling and search service', id: 'firecrawl', name: 'Firecrawl' },
  { description: 'Multimodal search engine', id: 'jina', name: 'Jina' },
  { description: 'Semantic search engine', id: 'exa', name: 'Exa' },
  { description: 'Chinese-optimized search engine', id: 'bocha', name: 'Bocha' },
];

export const crawlProviders: CrawlProvider[] = [
  { description: 'Simple and fast web crawling', id: 'naive', name: 'Naive', needsApi: false },
  { description: 'Intelligent content extraction', id: 'jina', name: 'Jina', needsApi: true },
  {
    description: 'Headless browser crawling',
    id: 'browserless',
    name: 'Browserless',
    needsApi: true,
  },
  {
    description: 'Semantic content crawling',
    id: 'exa',
    name: 'Exa',
    needsApi: true,
    sharedWith: 'exa',
  },
];
