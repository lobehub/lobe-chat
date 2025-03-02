import { browserless } from './browserless';
import { jina } from './jina';
import { naive } from './naive';

export const crawlImpls = {
  browserless,
  jina,
  naive,
};

export type CrawlImplType = keyof typeof crawlImpls;
