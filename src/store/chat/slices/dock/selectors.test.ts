import { describe, expect, it } from 'vitest';

import type { ChatStoreState } from '@/store/chat';

import { chatDockSelectors } from './selectors';

describe('chatDockSelectors', () => {
  const createState = (overrides?: Partial<ChatStoreState>) =>
    ({
      showDock: false,
      dockToolMessage: undefined,
      ...overrides,
    }) as ChatStoreState;

  describe('showDock', () => {
    it('should return the showDock state', () => {
      expect(chatDockSelectors.showDock(createState({ showDock: true }))).toBe(true);
      expect(chatDockSelectors.showDock(createState({ showDock: false }))).toBe(false);
    });
  });

  describe('toolUIMessageId', () => {
    it('should return undefined when dockToolMessage is not set', () => {
      expect(chatDockSelectors.toolUIMessageId(createState())).toBeUndefined();
    });

    it('should return the id when dockToolMessage is set', () => {
      const state = createState({ dockToolMessage: { id: 'test-id', identifier: 'test' } });
      expect(chatDockSelectors.toolUIMessageId(state)).toBe('test-id');
    });
  });

  describe('isMessageToolUIOpen', () => {
    it('should return false when id does not match or showDock is false', () => {
      const state = createState({
        dockToolMessage: { id: 'test-id', identifier: 'test' },
        showDock: false,
      });
      expect(chatDockSelectors.isMessageToolUIOpen('test-id')(state)).toBe(false);
      expect(chatDockSelectors.isMessageToolUIOpen('other-id')(state)).toBe(false);
    });

    it('should return true when id matches and showDock is true', () => {
      const state = createState({
        dockToolMessage: { id: 'test-id', identifier: 'test' },
        showDock: true,
      });
      expect(chatDockSelectors.isMessageToolUIOpen('test-id')(state)).toBe(true);
    });
  });

  describe('showToolUI', () => {
    it('should return false when dockToolMessage is not set', () => {
      expect(chatDockSelectors.showToolUI(createState())).toBe(false);
    });

    it('should return true when dockToolMessage is set', () => {
      const state = createState({ dockToolMessage: { id: 'test-id', identifier: 'test' } });
      expect(chatDockSelectors.showToolUI(state)).toBe(true);
    });
  });

  describe('toolUIIdentifier', () => {
    it('should return undefined when dockToolMessage is not set', () => {
      expect(chatDockSelectors.toolUIIdentifier(createState())).toBeUndefined();
    });

    it('should return the identifier when dockToolMessage is set', () => {
      const state = createState({ dockToolMessage: { id: 'test-id', identifier: 'test' } });
      expect(chatDockSelectors.toolUIIdentifier(state)).toBe('test');
    });
  });
});
