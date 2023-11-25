import { produce } from 'immer';

export type FilesState = string[];

export type FileDispatch =
  | { file: string; type: 'addFile' }
  | { id: string; type: 'deleteFile' }
  | { files: string[]; type: 'addFiles' };

export const filesReducer = (state: FilesState, payload: FileDispatch): FilesState => {
  switch (payload.type) {
    case 'addFile': {
      return produce(state, (draftState) => {
        draftState.push(payload.file);
      });
    }

    case 'deleteFile': {
      return produce(state, (draftState) => {
        const index = draftState.indexOf(payload.id);
        if (index !== -1) {
          draftState.splice(index, 1);
        }
      });
    }

    case 'addFiles': {
      return produce(state, (draftState) => {
        draftState.push(...payload.files);
      });
    }

    default: {
      return state;
    }
  }
};
