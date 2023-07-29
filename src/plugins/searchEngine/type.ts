export type OrganicResults = OrganicResult[];

export interface SearchItem {
  content: string;
  date?: string;
  displayed_link?: string;
  favicon?: string;
  link: string;
  source?: string;
  title: string;
}
export type Result = SearchItem[];

interface OrganicResult {
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

interface AboutThisResult {
  languages: string[];
  regions: string[];
  source: Source;
}

interface Source {
  description: string;
  icon: string;
  security?: string;
  source_info_link?: string;
}

interface RelatedResult {
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

interface AboutThisResult2 {
  languages: string[];
  regions: string[];
  source: Source2;
}

interface Source2 {
  description: string;
  icon: string;
}

interface RichSnippet {
  top: Top;
}

interface Top {
  detected_extensions: DetectedExtensions;
  extensions: string[];
}

interface DetectedExtensions {
  month_ago: number;
}
