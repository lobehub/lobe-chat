/**
 * Message UI state (editing, loading, etc.)
 */
export interface MessageStateState {
  /**
   * IDs of messages currently being edited
   */
  messageEditingIds: string[];

  /**
   * IDs of messages currently loading (creating, updating, etc.)
   */
  messageLoadingIds: string[];
}

export const messageStateInitialState: MessageStateState = {
  messageEditingIds: [],
  messageLoadingIds: [],
};
