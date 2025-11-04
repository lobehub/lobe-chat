import {
  ChatMessageExtra,
  ChatPluginPayload,
  ChatToolPayload,
  CreateMessageParams,
  UIChatMessage,
} from '@lobechat/types';
import isEqual from 'fast-deep-equal';
import { produce } from 'immer';

import { merge } from '@/utils/merge';

interface UpdateMessages {
  type: 'updateMessages';
  value: UIChatMessage[];
}

interface UpdateMessage {
  id: string;
  type: 'updateMessage';
  value: Partial<UIChatMessage>;
}

interface CreateMessage {
  id: string;
  type: 'createMessage';
  value: CreateMessageParams;
}

interface DeleteMessage {
  id: string;
  type: 'deleteMessage';
}

interface DeleteMessages {
  ids: string[];
  type: 'deleteMessages';
}

interface UpdatePluginState {
  id: string;
  key: string;
  type: 'updatePluginState';
  value: any;
}

interface UpdateMessagePlugin {
  id: string;
  type: 'updateMessagePlugin';
  value: Partial<ChatPluginPayload>;
}

interface UpdateMessageTools {
  id: string;
  tool_call_id: string;
  type: 'updateMessageTools';
  value: Partial<ChatPluginPayload>;
}

interface AddMessageTool {
  id: string;
  type: 'addMessageTool';
  value: ChatToolPayload;
}
interface DeleteMessageTool {
  id: string;
  tool_call_id: string;
  type: 'deleteMessageTool';
}

interface UpdateMessageExtra {
  id: string;
  key: string;
  type: 'updateMessageExtra';
  value: any;
}

interface UpdateGroupBlockToolResult {
  blockId: string;
  groupMessageId: string;
  toolId: string;
  toolResult: {
    content: string;
    error?: any;
    id: string;
    state?: any;
  };
  type: 'updateGroupBlockToolResult';
}

interface AddGroupBlock {
  blockId: string;
  groupMessageId: string;
  type: 'addGroupBlock';
  value: {
    content: string;
    id: string;
  };
}

export type MessageDispatch =
  | CreateMessage
  | UpdateMessage
  | UpdateMessages
  | UpdatePluginState
  | UpdateMessageExtra
  | DeleteMessage
  | UpdateMessagePlugin
  | UpdateMessageTools
  | AddMessageTool
  | DeleteMessageTool
  | DeleteMessages
  | UpdateGroupBlockToolResult
  | AddGroupBlock;

export const messagesReducer = (
  state: UIChatMessage[],
  payload: MessageDispatch,
): UIChatMessage[] => {
  switch (payload.type) {
    case 'updateMessage': {
      return produce(state, (draftState) => {
        const { id, value } = payload;

        // First, try to find in top-level messages
        const index = draftState.findIndex((i) => i.id === id);
        if (index >= 0) {
          draftState[index] = merge(draftState[index], { ...value, updatedAt: Date.now() });
          return;
        }

        // If not found, search in group message children (blocks)
        for (const message of draftState) {
          if (message.role === 'group' && message.children) {
            const blockIndex = message.children.findIndex((block) => block.id === id);
            if (blockIndex >= 0) {
              message.children[blockIndex] = merge(message.children[blockIndex], {
                ...value,
              });
              message.updatedAt = Date.now();
              return;
            }
          }
        }
      });
    }

    case 'updateMessageExtra': {
      return produce(state, (draftState) => {
        const { id, key, value } = payload;
        const message = draftState.find((i) => i.id === id);
        if (!message) return;

        if (!message.extra) {
          message.extra = { [key]: value } as ChatMessageExtra;
        } else {
          message.extra[key as keyof ChatMessageExtra] = value;
        }

        message.updatedAt = Date.now();
      });
    }

    case 'updatePluginState': {
      return produce(state, (draftState) => {
        const { id, key, value } = payload;
        const message = draftState.find((i) => i.id === id);
        if (!message) return;

        let newState;
        if (!message.pluginState) {
          newState = { [key]: value } as any;
        } else {
          newState = merge(message.pluginState, { [key]: value });
        }

        if (isEqual(message.pluginState, newState)) return;

        message.pluginState = newState;
        message.updatedAt = Date.now();
      });
    }

    case 'updateMessagePlugin': {
      return produce(state, (draftState) => {
        const { id, value } = payload;
        const message = draftState.find((i) => i.id === id);
        if (!message || message.role !== 'tool') return;

        message.plugin = merge(message.plugin, value);
        message.updatedAt = Date.now();
      });
    }

    case 'addMessageTool': {
      return produce(state, (draftState) => {
        const { id, value } = payload;
        const message = draftState.find((i) => i.id === id);
        if (!message || message.role !== 'assistant') return;

        if (!message.tools) {
          message.tools = [value];
        } else {
          const index = message.tools.findIndex((tool) => tool.id === value.id);

          if (index > 0) return;
          message.tools.push(value);
        }

        message.updatedAt = Date.now();
      });
    }

    case 'deleteMessageTool': {
      return produce(state, (draftState) => {
        const { id, tool_call_id } = payload;
        const message = draftState.find((i) => i.id === id);
        if (!message || message.role !== 'assistant' || !message.tools) return;

        message.tools = message.tools.filter((tool) => tool.id !== tool_call_id);

        message.updatedAt = Date.now();
      });
    }

    case 'updateMessageTools': {
      return produce(state, (draftState) => {
        const { id, value, tool_call_id } = payload;
        const message = draftState.find((i) => i.id === id);
        if (!message || message.role !== 'assistant' || !message.tools) return;

        const index = message.tools.findIndex((tool) => tool.id === tool_call_id);

        if (index < 0) return;
        message.tools[index] = merge(message.tools[index], value);

        message.updatedAt = Date.now();
      });
    }

    case 'createMessage': {
      return produce(state, (draftState) => {
        const { value, id } = payload;

        draftState.push({ ...value, createdAt: Date.now(), id, meta: {}, updatedAt: Date.now() });
      });
    }

    case 'updateMessages': {
      return payload.value;
    }

    case 'deleteMessage': {
      return produce(state, (draft) => {
        const { id } = payload;

        const index = draft.findIndex((m) => m.id === id);

        if (index >= 0) draft.splice(index, 1);
      });
    }
    case 'deleteMessages': {
      return produce(state, (draft) => {
        const { ids } = payload;

        return draft.filter((item) => {
          return !ids.includes(item.id);
        });
      });
    }

    case 'updateGroupBlockToolResult': {
      return produce(state, (draftState) => {
        const { groupMessageId, blockId, toolId, toolResult } = payload;

        // Find the group message
        const msg = draftState.find((m) => m.id === groupMessageId);
        if (!msg || msg.role !== 'group' || !msg.children) return;

        // Find the block within children
        const block = msg.children.find((b) => b.id === blockId);
        if (!block || !block.tools) return;

        // Find the tool and update its result
        const tool = block.tools.find((t) => t.id === toolId);
        if (!tool) return;

        // Update tool result (optimistic update)
        tool.result = toolResult;

        msg.updatedAt = Date.now();
      });
    }

    case 'addGroupBlock': {
      return produce(state, (draftState) => {
        const { groupMessageId, blockId, value } = payload;

        // Find the group message
        const msg = draftState.find((m) => m.id === groupMessageId);
        if (!msg || msg.role !== 'group' || !msg.children) return;

        // Add new block to children
        msg.children.push({
          content: value.content,
          id: blockId,
        });

        msg.updatedAt = Date.now();
      });
    }

    default: {
      throw new Error('暂未实现的 type，请检查 reducer');
    }
  }
};
