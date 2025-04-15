import dayjs from 'dayjs';

import { BuiltinToolManifest } from '@/types/tool';

import { systemPrompt } from './systemRole';

export const WebBrowsingApiName = {
  crawlMultiPages: 'crawlMultiPages',
  crawlSinglePage: 'crawlSinglePage',
  searchWithSearXNG: 'searchWithSearXNG',
};

export const WebBrowsingManifest: BuiltinToolManifest = {
  api: [
    {
      description:
        'A meta search engine. Useful for when you need to answer questions about current events. Input should be a search query. Output is a JSON array of the query results',
      name: WebBrowsingApiName.searchWithSearXNG,
      parameters: {
        properties: {
          optionalParams: {
            description: 'The optional parameters for search query',
            properties: {
              searchCategories: {
                description: 'The search categories you can set:',
                items: {
                  enum: [
                    'files',
                    'general',
                    'images',
                    'it',
                    'map',
                    'music',
                    'news',
                    'science',
                    'social_media',
                    'videos',
                  ],
                  type: 'string',
                },
                type: 'array',
              },
              searchEngines: {
                description: 'The search engines you can use:',
                items: {
                  enum: [
                    'google',
                    'bilibili',
                    'bing',
                    'duckduckgo',
                    'npm',
                    'pypi',
                    'github',
                    'arxiv',
                    'google scholar',
                    'z-library',
                    'reddit',
                    'imdb',
                    'brave',
                    'wikipedia',
                    'pinterest',
                    'unsplash',
                    'vimeo',
                    'youtube',
                  ],
                  type: 'string',
                },
                type: 'array',
              },
              searchTimeRange: {
                description: 'The time range you can set:',
                enum: ['anytime', 'day', 'week', 'month', 'year'],
                type: 'string',
              },
            },
            type: 'object',
          },
          query: {
            description: 'The search query',
            type: 'string',
          },
        },
        required: ['query'],
        type: 'object',
      },
    },
    {
      description:
        'A crawler can visit page content. Output is a JSON object of title, content, url and website',
      name: WebBrowsingApiName.crawlSinglePage,
      parameters: {
        properties: {
          url: {
            description: 'The url need to be crawled',
            type: 'string',
          },
        },
        required: ['url'],
        type: 'object',
      },
    },
    {
      description:
        'A crawler can visit multi pages. If need to visit multi website, use this one. Output is an array of JSON object of title, content, url and website',
      name: WebBrowsingApiName.crawlMultiPages,
      parameters: {
        properties: {
          urls: {
            items: {
              description: 'The urls need to be crawled',
              type: 'string',
            },
            type: 'array',
          },
        },
        required: ['urls'],
        type: 'object',
      },
    },
  ],
  identifier: 'lobe-web-browsing',
  meta: {
    avatar: '🌐',
    title: 'Web Browsing',
  },
  systemRole: systemPrompt(dayjs(new Date()).format('YYYY-MM-DD')),
  type: 'builtin',
};
