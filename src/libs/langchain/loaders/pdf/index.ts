import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';

export const PdfLoader = async (fileBlob: Blob) => {
  const loader = new PDFLoader(fileBlob, { splitPages: true });

  return await loader.load();
};
