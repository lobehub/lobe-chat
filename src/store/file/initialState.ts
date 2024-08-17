import { ImageFileState, initialImageFileState } from './slices/chat';

export type FilesStoreState = ImageFileState;

export const initialState: FilesStoreState = {
  ...initialImageFileState,
};
