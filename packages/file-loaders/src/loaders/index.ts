import { FileLoaderInterface, SupportedFileType } from '../types';
import { DocLoader } from './doc';
import { DocxLoader } from './docx';
// import { EpubLoader } from './epub';
import { ExcelLoader } from './excel';
import { PdfLoader } from './pdf';
import { PptxLoader } from './pptx';
import { TextLoader } from './text';

// Loader configuration map
// Key: file extension (lowercase, without leading dot) or specific type name
// Value: Loader Class implementing FileLoaderInterface
export const fileLoaders: Record<SupportedFileType, new () => FileLoaderInterface> = {
  doc: DocLoader,
  docx: DocxLoader,
  // epub: EpubLoader,
  excel: ExcelLoader,
  pdf: PdfLoader,
  pptx: PptxLoader,
  txt: TextLoader,
};
