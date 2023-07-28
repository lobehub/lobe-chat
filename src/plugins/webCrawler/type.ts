export type DataResults = DataItem[];

export type Result = {
  content?: string;
  title?: string;
  url?: string;
};
export interface DataItem {
  crawl: Crawl;
  markdown: string;
  metadata: Metadata;
  screenshotUrl: any;
  text: string;
  url: string;
}

export interface Crawl {
  depth: number;
  httpStatusCode: number;
  loadedTime: string;
  loadedUrl: string;
  referrerUrl: string;
}

export interface Metadata {
  author: any;
  canonicalUrl: string;
  description: string;
  keywords: string;
  languageCode: string;
  title: string;
}
