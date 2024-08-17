import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';

export const PdfLoader = async (blob: Blob) => {
  const loader = new PDFLoader(blob);

  return await loader.load();
};
