import { IEditor } from '@lobehub/editor';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface PublicState {}

export interface State extends PublicState {
  chatPanelExpanded: boolean;
  editor?: IEditor;
  editorState?: any; // EditorState from useEditorState hook
}

export const initialState: State = {
  chatPanelExpanded: true,
};
