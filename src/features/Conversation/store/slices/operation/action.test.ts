import { act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { ConversationContext } from '../../../types';
import { createStore } from '../../index';

// Mock conversation-flow parse function (必须 mock，因为这是外部库)
vi.mock('@lobechat/conversation-flow', () => ({
  parse: (messages: any[]) => {
    const messageMap: Record<string, any> = {};
    for (const msg of messages) {
      messageMap[msg.id] = msg;
    }
    return { flatList: messages, messageMap };
  },
}));

/**
 * Operation Actions Test Suite
 *
 * Note: The message operation actions (deleteMessage, modifyMessageContent, copyMessage)
 * have been moved to message/action/crud.ts and message/action/state.ts.
 *
 * This file now only tests toggleMessageEditing which remains in messageState slice.
 * See crud.test.ts for comprehensive CRUD operation tests.
 */
describe('Message State Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.restoreAllMocks();
  });

  describe('toggleMessageEditing', () => {
    it('should toggle message editing state to true', () => {
      const context: ConversationContext = {
        sessionId: 'session-1',
        topicId: null,
        threadId: null,
      };

      const store = createStore({ context });

      act(() => {
        store.getState().toggleMessageEditing('msg-1', true);
      });

      expect(store.getState().messageEditingIds).toContain('msg-1');
    });

    it('should toggle message editing state to false', () => {
      const context: ConversationContext = {
        sessionId: 'session-1',
        topicId: null,
        threadId: null,
      };

      const store = createStore({ context });

      // First toggle on
      act(() => {
        store.getState().toggleMessageEditing('msg-1', true);
      });
      expect(store.getState().messageEditingIds).toContain('msg-1');

      // Then toggle off
      act(() => {
        store.getState().toggleMessageEditing('msg-1', false);
      });

      expect(store.getState().messageEditingIds).not.toContain('msg-1');
    });
  });
});
