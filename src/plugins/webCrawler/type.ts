export type Result = {
  content: string;
  title?: string;
  url: string;
  website?: string;
};

export interface ParserResponse {
  /** author metadata */
  byline: string;

  /** HTML string of processed article content */
  content: string;

  /** content direction */
  dir: string;

  /** article description, or short excerpt from the content */
  excerpt: string;

  /** content language */
  lang: string;

  /** length of an article, in characters */
  length: number;

  /** name of the site */
  siteName: string;

  /** text content of the article, with all the HTML tags removed */
  textContent: string;

  /** article title */
  title: string;
}
