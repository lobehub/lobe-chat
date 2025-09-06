import { FileItem } from '@/types/files';

export interface ChatToolState {
  activePageContentUrl?: string;
  dalleImageLoading: Record<string, boolean>;
  dalleImageMap: Record<string, FileItem>;
  localFileLoading: Record<string, boolean>;
  pythonExecuting: Record<string, boolean>;
  pythonImageMap: Record<string, FileItem>;
  searchLoading: Record<string, boolean>;
}

export const initialToolState: ChatToolState = {
  dalleImageLoading: {},
  dalleImageMap: {},
  localFileLoading: {},
  pythonExecuting: {},
  pythonImageMap: {},
  searchLoading: {},
};
