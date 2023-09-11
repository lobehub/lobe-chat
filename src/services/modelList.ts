import { LanguageModelWhiteList } from '@/const/llm';

import { createHeaderWithOpenAI } from './_header';
import { OPENAI_URLS } from './_url';

export const fetchModelList = async (): Promise<string[]> => {
  const res = await fetch(OPENAI_URLS.models, {
    headers: createHeaderWithOpenAI(),
    method: 'POST',
  });

  const modelList: string[] = await res.json();

  return LanguageModelWhiteList.filter((i) => modelList.includes(i));
};
