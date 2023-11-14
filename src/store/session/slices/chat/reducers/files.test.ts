import { FileDispatch, FilesState, filesReducer } from './files';

describe('filesReducer', () => {
  it('should add a file to the state', () => {
    const initialState: FilesState = ['file1', 'file2'];
    const action: FileDispatch = { type: 'addFile', file: 'file3' };
    const newState = filesReducer(initialState, action);
    expect(newState).toEqual(['file1', 'file2', 'file3']);
  });

  it('should delete a file from the state by ID', () => {
    const initialState: FilesState = ['file1', 'file2', 'file3'];
    const action: FileDispatch = { type: 'deleteFile', id: 'file2' };
    const newState = filesReducer(initialState, action);
    expect(newState).toEqual(['file1', 'file3']);
  });

  it('should return the state unchanged if file ID does not exist for deletion', () => {
    const initialState: FilesState = ['file1', 'file2', 'file3'];
    const action: FileDispatch = { type: 'deleteFile', id: 'file4' };
    const newState = filesReducer(initialState, action);
    expect(newState).toEqual(['file1', 'file2', 'file3']);
  });

  it('should add multiple files to the state', () => {
    const initialState: FilesState = ['file1', 'file2'];
    const action: FileDispatch = { type: 'addFiles', files: ['file3', 'file4'] };
    const newState = filesReducer(initialState, action);
    expect(newState).toEqual(['file1', 'file2', 'file3', 'file4']);
  });

  it('should return the initial state if the action type is unknown', () => {
    const initialState: FilesState = ['file1', 'file2'];
    const action = { type: 'unknown', id: 'file1' };
    const newState = filesReducer(initialState, action as FileDispatch);
    expect(newState).toEqual(['file1', 'file2']);
  });
});
