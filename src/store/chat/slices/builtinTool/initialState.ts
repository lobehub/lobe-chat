import { FileItem } from '@/types/files';

export interface ChatToolState {
  activePageContentUrl?: string;
  dalleImageLoading: Record<string, boolean>;
  dalleImageMap: Record<string, FileItem>;
  searchLoading: Record<string, boolean>;
}

export const initialToolState: ChatToolState = {
  dalleImageLoading: {},
  dalleImageMap: {},
  searchLoading: {},
};
