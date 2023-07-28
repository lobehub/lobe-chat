import querystring from 'query-string';

import { PluginRunner } from '@/plugins/type';

import { OrganicResults, Result } from './type';

const BASE_URL = 'https://serpapi.com/search';

const API_KEY = process.env.SERPAI_API_KEY;

const fetchResult: PluginRunner<{ keywords: string }, Result> = async ({ keywords }) => {
  const params = {
    api_key: API_KEY,
    engine: 'google',
    gl: 'cn',
    google_domain: 'google.com',
    hl: 'zh-cn',
    location: 'China',
    q: keywords,
  };

  const query = querystring.stringify(params);

  const res = await fetch(`${BASE_URL}?${query}`);

  const data = await res.json();

  const results = data.organic_results as OrganicResults;

  return results.map((r) => ({
    content: r.snippet,
    date: r.date,
    link: r.link,
    source: r.source,
    title: r.title,
  }));
};

export default fetchResult;
