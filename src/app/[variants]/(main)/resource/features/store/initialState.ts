import { ResouceManagerMode } from '@/features/ResourceManager';

export interface State {
  /**
   * Current view item ID (document ID or file ID)
   */
  currentViewItemId?: string;
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
  currentViewItemId: undefined,
  mode: 'files',
  selectedFileIds: [],
};
