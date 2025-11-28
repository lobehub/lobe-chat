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
}

export const initialState: State = {
  currentViewItemId: undefined,
  mode: 'files',
};
