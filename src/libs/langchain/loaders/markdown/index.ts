import { MarkdownTextSplitter } from 'langchain/text_splitter';

import { loaderConfig } from '../config';

export const MarkdownLoader = async (text: string) => {
  const splitter = new MarkdownTextSplitter(loaderConfig);

  return await splitter.createDocuments([text]);
};
