import { browserless } from './browserless';
import { jina } from './jina';
import { naive } from './naive';
import { search1api } from './search1api';

export const crawlImpls = {
  browserless,
  jina,
  naive,
  search1api,
};

export type CrawlImplType = keyof typeof crawlImpls;
