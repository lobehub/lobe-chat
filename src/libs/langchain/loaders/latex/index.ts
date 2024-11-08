import { LatexTextSplitter } from 'langchain/text_splitter';

import { loaderConfig } from '../config';

export const LatexLoader = async (text: string) => {
  const splitter = new LatexTextSplitter(loaderConfig);

  return await splitter.createDocuments([text]);
};
