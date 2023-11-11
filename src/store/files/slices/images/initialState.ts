import { FilePreview } from '@/types/files';

export interface ImageFileState {
  imagesMap: Record<string, FilePreview>;
  inputFilesList: string[];
}

export const initialImageFileState: ImageFileState = {
  imagesMap: {},
  inputFilesList: ['file-B2ke8s63'],
};
