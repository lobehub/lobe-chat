import { describe, expect, it } from 'vitest';

import type { ChatStoreState } from '@/store/chat';

import { chatPortalSelectors } from './selectors';

describe('chatDockSelectors', () => {
  const createState = (overrides?: Partial<ChatStoreState>) =>
    ({
      showPortal: false,
      portalToolMessage: undefined,
      ...overrides,
    }) as ChatStoreState;

  describe('showDock', () => {
    it('should return the showDock state', () => {
      expect(chatPortalSelectors.showPortal(createState({ showPortal: true }))).toBe(true);
      expect(chatPortalSelectors.showPortal(createState({ showPortal: false }))).toBe(false);
    });
  });

  describe('toolUIMessageId', () => {
    it('should return undefined when dockToolMessage is not set', () => {
      expect(chatPortalSelectors.toolMessageId(createState())).toBeUndefined();
    });

    it('should return the id when dockToolMessage is set', () => {
      const state = createState({ portalToolMessage: { id: 'test-id', identifier: 'test' } });
      expect(chatPortalSelectors.toolMessageId(state)).toBe('test-id');
    });
  });

  describe('isMessageToolUIOpen', () => {
    it('should return false when id does not match or showDock is false', () => {
      const state = createState({
        portalToolMessage: { id: 'test-id', identifier: 'test' },
        showPortal: false,
      });
      expect(chatPortalSelectors.isPluginUIOpen('test-id')(state)).toBe(false);
      expect(chatPortalSelectors.isPluginUIOpen('other-id')(state)).toBe(false);
    });

    it('should return true when id matches and showDock is true', () => {
      const state = createState({
        portalToolMessage: { id: 'test-id', identifier: 'test' },
        showPortal: true,
      });
      expect(chatPortalSelectors.isPluginUIOpen('test-id')(state)).toBe(true);
    });
  });

  describe('showToolUI', () => {
    it('should return false when dockToolMessage is not set', () => {
      expect(chatPortalSelectors.showPluginUI(createState())).toBe(false);
    });

    it('should return true when dockToolMessage is set', () => {
      const state = createState({ portalToolMessage: { id: 'test-id', identifier: 'test' } });
      expect(chatPortalSelectors.showPluginUI(state)).toBe(true);
    });
  });

  describe('toolUIIdentifier', () => {
    it('should return undefined when dockToolMessage is not set', () => {
      expect(chatPortalSelectors.toolUIIdentifier(createState())).toBeUndefined();
    });

    it('should return the identifier when dockToolMessage is set', () => {
      const state = createState({ portalToolMessage: { id: 'test-id', identifier: 'test' } });
      expect(chatPortalSelectors.toolUIIdentifier(state)).toBe('test');
    });
  });

  describe('showFilePreview', () => {
    it('should return false when portalFile is not set', () => {
      expect(chatPortalSelectors.showFilePreview(createState())).toBe(false);
    });

    it('should return true when portalFile is set', () => {
      const state = createState({ portalFile: { fileId: 'file-id', chunkText: 'chunk' } });
      expect(chatPortalSelectors.showFilePreview(state)).toBe(true);
    });
  });

  describe('previewFileId', () => {
    it('should return undefined when portalFile is not set', () => {
      expect(chatPortalSelectors.previewFileId(createState())).toBeUndefined();
    });

    it('should return the fileId when portalFile is set', () => {
      const state = createState({ portalFile: { fileId: 'file-id', chunkText: 'chunk' } });
      expect(chatPortalSelectors.previewFileId(state)).toBe('file-id');
    });
  });
});
