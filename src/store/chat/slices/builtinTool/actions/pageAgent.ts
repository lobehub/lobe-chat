import { PageAgentExecutionRuntime } from '@lobechat/builtin-tool-page-agent/executionRuntime';
import debug from 'debug';
import { StateCreator } from 'zustand/vanilla';

import { ChatStore } from '@/store/chat/store';

const log = debug('page:page-agent');

export interface PageAgentAction {
  // ============ Batch Operations ============
  batchUpdate: (id: string, params: any) => Promise<boolean>;

  // ============ Snapshot Operations ============
  compareSnapshots: (id: string, params: any) => Promise<boolean>;

  // ============ List Operations ============
  convertToList: (id: string, params: any) => Promise<boolean>;
  // ============ Basic CRUD (Legacy) ============
  createNode: (id: string, params: any) => Promise<boolean>;
  // ============ Image Operations ============
  cropImage: (id: string, params: any) => Promise<boolean>;
  deleteNode: (id: string, params: any) => Promise<boolean>;
  deleteSnapshot: (id: string, params: any) => Promise<boolean>;
  // ============ Table Operations ============
  deleteTableColumn: (id: string, params: any) => Promise<boolean>;

  deleteTableRow: (id: string, params: any) => Promise<boolean>;

  duplicateNode: (id: string, params: any) => Promise<boolean>;

  // ============ Document Metadata ============
  editTitle: (id: string, params: any) => Promise<boolean>;
  // ============ Query & Read ============
  getPageContent: (id: string, params: any) => Promise<boolean>;
  indentListItem: (id: string, params: any) => Promise<boolean>;
  // ============ Initialize ============
  initPage: (id: string, params: any) => Promise<boolean>;

  insertTableColumn: (id: string, params: any) => Promise<boolean>;
  insertTableRow: (id: string, params: any) => Promise<boolean>;
  listSnapshots: (id: string, params: any) => Promise<boolean>;
  // ============ Structure Operations ============
  mergeNodes: (id: string, params: any) => Promise<boolean>;

  // ============ Unified Node Operations ============
  modifyNodes: (id: string, params: any) => Promise<boolean>;

  moveNode: (id: string, params: any) => Promise<boolean>;
  outdentListItem: (id: string, params: any) => Promise<boolean>;
  // ============ Text Operations ============
  replaceText: (id: string, params: any) => Promise<boolean>;
  resizeImage: (id: string, params: any) => Promise<boolean>;

  restoreSnapshot: (id: string, params: any) => Promise<boolean>;
  rotateImage: (id: string, params: any) => Promise<boolean>;
  saveSnapshot: (id: string, params: any) => Promise<boolean>;
  setImageAlt: (id: string, params: any) => Promise<boolean>;

  splitNode: (id: string, params: any) => Promise<boolean>;
  toggleListType: (id: string, params: any) => Promise<boolean>;
  unwrapNode: (id: string, params: any) => Promise<boolean>;
  updateNode: (id: string, params: any) => Promise<boolean>;
  wrapNodes: (id: string, params: any) => Promise<boolean>;
}

// Create singleton instance of the runtime
const runtime = new PageAgentExecutionRuntime();

// Export runtime for external use (e.g., setting editor instance)
export { runtime as pageAgentRuntime };

export const pageAgentSlice: StateCreator<
  ChatStore,
  [['zustand/devtools', never]],
  [],
  PageAgentAction
> = (set, get) => ({
  // ============ Batch Operations ============
  batchUpdate: async (id, params) => {
    log('batchUpdate', id, params);
    return true;
  },

  // ============ Snapshot Operations ============
  compareSnapshots: async (id, params) => {
    log('compareSnapshots', id, params);
    return true;
  },

  // ============ List Operations ============
  convertToList: async (id, params) => {
    log('convertToList', id, params);
    return true;
  },

  // ============ Basic CRUD ============
  createNode: async (id, params) => {
    const parentOperationId = get().messageOperationMap[id];

    const { operationId } = get().startOperation({
      context: { messageId: id },
      metadata: { apiName: 'createNode', params, startTime: Date.now() },
      parentOperationId,
      type: 'builtinToolPageAgent',
    });

    const context = { operationId };

    try {
      const result = await runtime.createNode(params);
      const { content, success, error, state } = result;

      get().completeOperation(operationId);
      await get().optimisticUpdateMessageContent(id, content, undefined, context);

      if (success) {
        await get().optimisticUpdatePluginState(id, state, context);
      } else {
        await get().optimisticUpdatePluginError(
          id,
          {
            body: error,
            message: error?.message || content,
            type: 'PluginServerError',
          },
          context,
        );
      }

      return true;
    } catch (error) {
      const err = error as Error;

      if (err.message.includes('The user aborted a request.') || err.name === 'AbortError') {
        get().failOperation(operationId, {
          message: 'User cancelled the request',
          type: 'UserAborted',
        });
        return true;
      }

      get().failOperation(operationId, {
        message: err.message,
        type: 'PluginServerError',
      });

      await get().optimisticUpdateMessagePluginError(
        id,
        {
          body: error,
          message: err.message,
          type: 'PluginServerError',
        },
        context,
      );

      return true;
    }
  },

  // ============ Image Operations ============
  cropImage: async (id, params) => {
    log('cropImage', id, params);
    return true;
  },

  deleteNode: async (id, params) => {
    const parentOperationId = get().messageOperationMap[id];

    const { operationId } = get().startOperation({
      context: { messageId: id },
      metadata: { apiName: 'deleteNode', params, startTime: Date.now() },
      parentOperationId,
      type: 'builtinToolPageAgent',
    });

    const context = { operationId };

    try {
      const result = await runtime.deleteNode(params);
      const { content, success, error, state } = result;

      get().completeOperation(operationId);
      await get().optimisticUpdateMessageContent(id, content, undefined, context);

      if (success) {
        await get().optimisticUpdatePluginState(id, state, context);
      } else {
        await get().optimisticUpdatePluginError(
          id,
          {
            body: error,
            message: error?.message || content,
            type: 'PluginServerError',
          },
          context,
        );
      }

      return true;
    } catch (error) {
      const err = error as Error;

      if (err.message.includes('The user aborted a request.') || err.name === 'AbortError') {
        get().failOperation(operationId, {
          message: 'User cancelled the request',
          type: 'UserAborted',
        });
        return true;
      }

      get().failOperation(operationId, {
        message: err.message,
        type: 'PluginServerError',
      });

      await get().optimisticUpdateMessagePluginError(
        id,
        {
          body: error,
          message: err.message,
          type: 'PluginServerError',
        },
        context,
      );

      return true;
    }
  },

  deleteSnapshot: async (id, params) => {
    log('deleteSnapshot', id, params);
    return true;
  },

  // ============ Table Operations ============
  deleteTableColumn: async (id, params) => {
    log('deleteTableColumn', id, params);
    return true;
  },

  deleteTableRow: async (id, params) => {
    log('deleteTableRow', id, params);
    return true;
  },

  duplicateNode: async (id, params) => {
    log('duplicateNode', id, params);
    return true;
  },

  // ============ Document Metadata ============
  editTitle: async (id, params) => {
    const parentOperationId = get().messageOperationMap[id];

    const { operationId } = get().startOperation({
      context: { messageId: id },
      metadata: { apiName: 'editTitle', params, startTime: Date.now() },
      parentOperationId,
      type: 'builtinToolPageAgent',
    });

    const context = { operationId };

    try {
      const result = await runtime.editTitle(params);
      const { content, success, error, state } = result;

      get().completeOperation(operationId);
      await get().optimisticUpdateMessageContent(id, content, undefined, context);

      if (success) {
        await get().optimisticUpdatePluginState(id, state, context);
      } else {
        await get().optimisticUpdatePluginError(
          id,
          {
            body: error,
            message: error?.message || content,
            type: 'PluginServerError',
          },
          context,
        );
      }

      return true;
    } catch (error) {
      const err = error as Error;

      if (err.message.includes('The user aborted a request.') || err.name === 'AbortError') {
        get().failOperation(operationId, {
          message: 'User cancelled the request',
          type: 'UserAborted',
        });
        return true;
      }

      get().failOperation(operationId, {
        message: err.message,
        type: 'PluginServerError',
      });

      await get().optimisticUpdateMessagePluginError(
        id,
        {
          body: error,
          message: err.message,
          type: 'PluginServerError',
        },
        context,
      );

      return true;
    }
  },

  // ============ Query & Read ============
  getPageContent: async (id, params) => {
    const parentOperationId = get().messageOperationMap[id];

    const { operationId } = get().startOperation({
      context: { messageId: id },
      metadata: { apiName: 'getPageContent', params, startTime: Date.now() },
      parentOperationId,
      type: 'builtinToolPageAgent',
    });

    const context = { operationId };

    try {
      const result = await runtime.getPageContent(params);
      const { content, success, error, state } = result;

      get().completeOperation(operationId);
      await get().optimisticUpdateMessageContent(id, content, undefined, context);

      if (success) {
        await get().optimisticUpdatePluginState(id, state, context);
      } else {
        await get().optimisticUpdatePluginError(
          id,
          {
            body: error,
            message: error?.message || content,
            type: 'PluginServerError',
          },
          context,
        );
      }

      return true;
    } catch (error) {
      const err = error as Error;

      if (err.message.includes('The user aborted a request.') || err.name === 'AbortError') {
        get().failOperation(operationId, {
          message: 'User cancelled the request',
          type: 'UserAborted',
        });
        return true;
      }

      get().failOperation(operationId, {
        message: err.message,
        type: 'PluginServerError',
      });

      await get().optimisticUpdateMessagePluginError(
        id,
        {
          body: error,
          message: err.message,
          type: 'PluginServerError',
        },
        context,
      );

      return true;
    }
  },

  indentListItem: async (id, params) => {
    log('indentListItem', id, params);
    return true;
  },

  // ============ Initialize ============
  initPage: async (id, params) => {
    const parentOperationId = get().messageOperationMap[id];

    const { operationId } = get().startOperation({
      context: { messageId: id },
      metadata: { apiName: 'initPage', params, startTime: Date.now() },
      parentOperationId,
      type: 'builtinToolPageAgent',
    });

    const context = { operationId };

    try {
      const result = await runtime.initPage(params);
      const { content, success, error, state } = result;

      get().completeOperation(operationId);
      await get().optimisticUpdateMessageContent(id, content, undefined, context);

      if (success) {
        await get().optimisticUpdatePluginState(id, state, context);
      } else {
        await get().optimisticUpdatePluginError(
          id,
          {
            body: error,
            message: error?.message || content,
            type: 'PluginServerError',
          },
          context,
        );
      }

      return true;
    } catch (error) {
      const err = error as Error;

      if (err.message.includes('The user aborted a request.') || err.name === 'AbortError') {
        get().failOperation(operationId, {
          message: 'User cancelled the request',
          type: 'UserAborted',
        });
        return true;
      }

      get().failOperation(operationId, {
        message: err.message,
        type: 'PluginServerError',
      });

      await get().optimisticUpdateMessagePluginError(
        id,
        {
          body: error,
          message: err.message,
          type: 'PluginServerError',
        },
        context,
      );

      return true;
    }
  },

  insertTableColumn: async (id, params) => {
    log('insertTableColumn', id, params);
    return true;
  },

  insertTableRow: async (id, params) => {
    log('insertTableRow', id, params);
    return true;
  },

  listSnapshots: async (id, params) => {
    log('listSnapshots', id, params);
    return true;
  },

  // ============ Structure Operations ============
  mergeNodes: async (id, params) => {
    log('mergeNodes', id, params);
    return true;
  },

  // ============ Unified Node Operations ============
  modifyNodes: async (id, params) => {
    const parentOperationId = get().messageOperationMap[id];

    const { operationId } = get().startOperation({
      context: { messageId: id },
      metadata: { apiName: 'modifyNodes', params, startTime: Date.now() },
      parentOperationId,
      type: 'builtinToolPageAgent',
    });

    const context = { operationId };

    try {
      const result = await runtime.modifyNodes(params);
      const { content, success, error, state } = result;

      get().completeOperation(operationId);
      await get().optimisticUpdateMessageContent(id, content, undefined, context);

      if (success) {
        await get().optimisticUpdatePluginState(id, state, context);
      } else {
        await get().optimisticUpdatePluginError(
          id,
          {
            body: error,
            message: error?.message || content,
            type: 'PluginServerError',
          },
          context,
        );
      }

      return true;
    } catch (error) {
      const err = error as Error;

      if (err.message.includes('The user aborted a request.') || err.name === 'AbortError') {
        get().failOperation(operationId, {
          message: 'User cancelled the request',
          type: 'UserAborted',
        });
        return true;
      }

      get().failOperation(operationId, {
        message: err.message,
        type: 'PluginServerError',
      });

      await get().optimisticUpdateMessagePluginError(
        id,
        {
          body: error,
          message: err.message,
          type: 'PluginServerError',
        },
        context,
      );

      return true;
    }
  },

  moveNode: async (id, params) => {
    log('moveNode', id, params);
    return true;
  },

  outdentListItem: async (id, params) => {
    log('outdentListItem', id, params);
    return true;
  },

  // ============ Text Operations ============
  replaceText: async (id, params) => {
    const parentOperationId = get().messageOperationMap[id];

    const { operationId } = get().startOperation({
      context: { messageId: id },
      metadata: { apiName: 'replaceText', params, startTime: Date.now() },
      parentOperationId,
      type: 'builtinToolPageAgent',
    });

    const context = { operationId };

    try {
      const result = await runtime.replaceText(params);
      const { content, success, error, state } = result;

      get().completeOperation(operationId);
      await get().optimisticUpdateMessageContent(id, content, undefined, context);

      if (success) {
        await get().optimisticUpdatePluginState(id, state, context);
      } else {
        await get().optimisticUpdatePluginError(
          id,
          {
            body: error,
            message: error?.message || content,
            type: 'PluginServerError',
          },
          context,
        );
      }

      return true;
    } catch (error) {
      const err = error as Error;

      if (err.message.includes('The user aborted a request.') || err.name === 'AbortError') {
        get().failOperation(operationId, {
          message: 'User cancelled the request',
          type: 'UserAborted',
        });
        return true;
      }

      get().failOperation(operationId, {
        message: err.message,
        type: 'PluginServerError',
      });

      await get().optimisticUpdateMessagePluginError(
        id,
        {
          body: error,
          message: err.message,
          type: 'PluginServerError',
        },
        context,
      );

      return true;
    }
  },

  resizeImage: async (id, params) => {
    log('resizeImage', id, params);
    return true;
  },

  restoreSnapshot: async (id, params) => {
    log('restoreSnapshot', id, params);
    return true;
  },

  rotateImage: async (id, params) => {
    log('rotateImage', id, params);
    return true;
  },

  saveSnapshot: async (id, params) => {
    log('saveSnapshot', id, params);
    return true;
  },

  setImageAlt: async (id, params) => {
    log('setImageAlt', id, params);
    return true;
  },

  splitNode: async (id, params) => {
    log('splitNode', id, params);
    return true;
  },

  toggleListType: async (id, params) => {
    log('toggleListType', id, params);
    return true;
  },

  unwrapNode: async (id, params) => {
    log('unwrapNode', id, params);
    return true;
  },

  updateNode: async (id, params) => {
    const parentOperationId = get().messageOperationMap[id];

    const { operationId } = get().startOperation({
      context: { messageId: id },
      metadata: { apiName: 'updateNode', params, startTime: Date.now() },
      parentOperationId,
      type: 'builtinToolPageAgent',
    });

    const context = { operationId };

    try {
      const result = await runtime.updateNode(params);
      const { content, success, error, state } = result;

      get().completeOperation(operationId);
      await get().optimisticUpdateMessageContent(id, content, undefined, context);

      if (success) {
        await get().optimisticUpdatePluginState(id, state, context);
      } else {
        await get().optimisticUpdatePluginError(
          id,
          {
            body: error,
            message: error?.message || content,
            type: 'PluginServerError',
          },
          context,
        );
      }

      return true;
    } catch (error) {
      const err = error as Error;

      if (err.message.includes('The user aborted a request.') || err.name === 'AbortError') {
        get().failOperation(operationId, {
          message: 'User cancelled the request',
          type: 'UserAborted',
        });
        return true;
      }

      get().failOperation(operationId, {
        message: err.message,
        type: 'PluginServerError',
      });

      await get().optimisticUpdateMessagePluginError(
        id,
        {
          body: error,
          message: err.message,
          type: 'PluginServerError',
        },
        context,
      );

      return true;
    }
  },

  wrapNodes: async (id, params) => {
    log('wrapNodes', id, params);
    return true;
  },
});
