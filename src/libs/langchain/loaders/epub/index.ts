import { EPubLoader as Loader } from '@langchain/community/document_loaders/fs/epub';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { loaderConfig } from '../config';
import { TempFileManager } from '@/server/utils/tempFileManager';

export const EPubLoader = async (content: Uint8Array) => {
  const tempManager = new TempFileManager();
  try {
    const tempPath = await tempManager.writeTempFile(content);
    const loader = new Loader(tempPath);
    const documents = await loader.load();

    const splitter = new RecursiveCharacterTextSplitter(loaderConfig);
    return await splitter.splitDocuments(documents);
  } catch (e) {
    throw new Error(`EPubLoader error: ${(e as Error).message}`);
  } finally {
    tempManager.cleanup(); // 确保清理
  }

};
