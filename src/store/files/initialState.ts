import { ImageFileState, initialImageFileState } from './slices/images';

export type FilesStoreState = ImageFileState;

export const initialState: FilesStoreState = {
  ...initialImageFileState,
};
