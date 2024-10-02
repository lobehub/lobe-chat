import { renderHook } from '@testing-library/react';
import { useTranslation } from 'react-i18next';
import { Mock, describe, expect, it, vi } from 'vitest';

import { useServerConfigStore } from '@/store/serverConfig';

import { useInboxAgentMeta } from './useInboxAgentMeta';

// Mock the dependencies
vi.mock('react-i18next', () => ({
  useTranslation: vi.fn(),
}));

vi.mock('@/store/serverConfig', () => ({
  useServerConfigStore: vi.fn(),
}));

const versionMock = vi.hoisted(() => ({
  isCustomBranding: false,
}));

vi.mock('@/const/version', () => versionMock);

describe('useInboxAgentMeta', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return correct meta when enableCommercialInbox is false', () => {
    const mockTranslation = vi.fn((key) => `translated_${key}`);
    (useTranslation as Mock).mockReturnValue({ t: mockTranslation });
    versionMock.isCustomBranding = false;
    const { result } = renderHook(() => useInboxAgentMeta());

    expect(result.current).toEqual({
      description: 'translated_inbox.desc',
      title: 'translated_inbox.title',
    });
    expect(mockTranslation).toHaveBeenCalledWith('inbox.title');
    expect(mockTranslation).toHaveBeenCalledWith('inbox.desc');
  });

  it('should return correct meta when enableCommercialInbox is true', () => {
    const mockTranslation = vi.fn((key, options) => `translated_${key}_${options.ns}`);
    (useTranslation as Mock).mockReturnValue({ t: mockTranslation });
    versionMock.isCustomBranding = true;
    const { result } = renderHook(() => useInboxAgentMeta());

    expect(result.current).toEqual({
      description: 'translated_chat.inbox.desc_custom',
      title: 'translated_chat.inbox.title_custom',
    });
    expect(mockTranslation).toHaveBeenCalledWith('chat.inbox.title', { ns: 'custom' });
    expect(mockTranslation).toHaveBeenCalledWith('chat.inbox.desc', { ns: 'custom' });
  });
});
