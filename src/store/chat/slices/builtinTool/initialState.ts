import { FileItem } from '@/types/files';

export interface ChatToolState {
  dalleImageLoading: Record<string, boolean>;
  dalleImageMap: Record<string, FileItem>;
}

export const initialToolState: ChatToolState = {
  dalleImageLoading: {},
  dalleImageMap: {},
};
