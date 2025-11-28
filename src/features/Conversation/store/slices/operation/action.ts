import type { StateCreator } from 'zustand';

import type { Store as ConversationStore } from '../../action';

/**
 * Message Operation Actions
 *
 * Note: This slice is now mostly deprecated as the operations have been moved to:
 * - message/action/crud.ts - deleteMessage, and other CRUD operations
 * - message/action/state.ts - copyMessage, modifyMessageContent
 *
 * Keeping this slice for backward compatibility and future extension.
 */
export interface MessageOperationAction {
  // Placeholder - operations moved to message/action/crud.ts and message/action/state.ts
}

export const messageOperationSlice: StateCreator<
  ConversationStore,
  [['zustand/devtools', never]],
  [],
  MessageOperationAction
> = () => ({
  // Operations moved to message/action/crud.ts and message/action/state.ts
});
