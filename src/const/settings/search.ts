import { UserSearchConfig } from '@/types/user/settings/search';

export const DEFAULT_SEARCH_CONFIG: UserSearchConfig = {
  crawlApiKey: '',
  crawlConfig: {
    executeJS: false,
    includeImages: false,
    maxContentLength: 10_000,
    outputFormat: 'markdown',
    timeout: 30,
  },
  crawlEndpoint: '',

  crawlProvider: 'naive',

  searchApiKey: '',
  searchConfig: {
    excludeDomains: '',
    maxResults: 10,
  },
  searchEndpoint: '',

  searchProvider: 'tavily',
};
