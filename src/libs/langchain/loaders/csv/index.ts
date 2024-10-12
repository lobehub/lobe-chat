import { CSVLoader } from '@langchain/community/document_loaders/fs/csv';

export const CsVLoader = async (fileBlob: Blob) => {
  const loader = new CSVLoader(fileBlob);

  return await loader.load();
};
