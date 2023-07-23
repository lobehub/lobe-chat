import querystring from 'query-string';

const BASE_URL = 'https://serpapi.com/search';

const API_KEY = process.env.SERPAI_API_KEY;

export type OrganicResults = OrganicResult[];

export interface OrganicResult {
  about_page_link: string;
  about_page_serpapi_link: string;
  about_this_result: AboutThisResult;
  cached_page_link?: string;
  date?: string;
  displayed_link: string;
  favicon?: string;
  link: string;
  position: number;
  related_results?: RelatedResult[];
  rich_snippet?: RichSnippet;
  snippet: string;
  snippet_highlighted_words?: string[];
  source: string;
  thumbnail?: string;
  title: string;
}

export interface AboutThisResult {
  languages: string[];
  regions: string[];
  source: Source;
}

export interface Source {
  description: string;
  icon: string;
  security?: string;
  source_info_link?: string;
}

export interface RelatedResult {
  about_page_link: string;
  about_page_serpapi_link: string;
  about_this_result: AboutThisResult2;
  cached_page_link: string;
  date: string;
  displayed_link: string;
  link: string;
  position: number;
  snippet: string;
  snippet_highlighted_words: string[];
  title: string;
}

export interface AboutThisResult2 {
  languages: string[];
  regions: string[];
  source: Source2;
}

export interface Source2 {
  description: string;
  icon: string;
}

export interface RichSnippet {
  top: Top;
}

export interface Top {
  detected_extensions: DetectedExtensions;
  extensions: string[];
}

export interface DetectedExtensions {
  month_ago: number;
}

const fetchResult = async (keywords: string) => {
  const params = {
    api_key: API_KEY,
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
