import { filesSelectors as imageFilesSelectors } from './slices/chat';
import { ttsFilesSelectors } from './slices/tts';

export const filesSelectors = {
  ...imageFilesSelectors,
  ...ttsFilesSelectors,
};

export * from './slices/fileManager/selectors';
export * from '@/store/file/slices/chat/newSelectors';
