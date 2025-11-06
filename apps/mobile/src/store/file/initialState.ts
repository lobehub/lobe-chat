import { ImageFileState, initialImageFileState } from './slices/chat/initialState';

export type FilesStoreState = ImageFileState;

export const initialState: FilesStoreState = {
  ...initialImageFileState,
};
