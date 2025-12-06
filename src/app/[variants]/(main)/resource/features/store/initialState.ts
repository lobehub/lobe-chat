import { ResouceManagerMode } from '@/features/ResourceManager';
import { FilesTabs } from '@/types/files';

export interface State {
  /**
   * Current file category filter
   */
  category: FilesTabs;
  /**
   * Current view item ID (document ID or file ID)
   */
  currentViewItemId?: string;
  /**
   * Current library ID
   */
  libraryId?: string;
  /**
   * View mode for displaying resources
   */
  mode: ResouceManagerMode;
  /**
   * Selected file IDs in the file explorer
   */
  selectedFileIds: string[];
}

export const initialState: State = {
  category: FilesTabs.All,
  currentViewItemId: undefined,
  libraryId: undefined,
  mode: 'explorer',
  selectedFileIds: [],
};
