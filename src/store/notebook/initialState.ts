import { NotebookDocument } from '@lobechat/types';

export interface NotebookState {
  /**
   * Map of topicId -> documents
   */
  documentsMap: Record<string, NotebookDocument[]>;
}

export const initialNotebookState: NotebookState = {
  documentsMap: {},
};
