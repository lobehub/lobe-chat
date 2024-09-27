import { renderHook } from '@testing-library/react';
import { useTranslation } from 'react-i18next';
import { Mock, describe, expect, it, vi } from 'vitest';

import { useServerConfigStore } from '@/store/serverConfig';
import { useSessionStore } from '@/store/session';

import { useInboxAgentMeta } from './useInboxAgentMeta';

// Mock the dependencies
vi.mock('react-i18next', () => ({
  useTranslation: vi.fn(),
}));

vi.mock('@/store/serverConfig', () => ({
  useServerConfigStore: vi.fn(),
}));

vi.mock('@/store/session', () => ({
  useSessionStore: vi.fn(),
}));

describe('useInboxAgentMeta', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return correct meta for non-inbox session', () => {
    (useTranslation as Mock).mockReturnValue({ t: vi.fn() });
    (useServerConfigStore as Mock).mockReturnValue({ enableCommercialInbox: false });
    (useSessionStore as unknown as Mock).mockReturnValue([
      'Agent Title',
      'Agent Description',
      'avatar-url',
      false,
    ]);

    const { result } = renderHook(() => useInboxAgentMeta());

    expect(result.current).toEqual({
      avatar: 'avatar-url',
      description: 'Agent Description',
      title: 'Agent Title',
    });
  });

  it('should return correct meta for inbox session with commercial inbox disabled', () => {
    const mockTranslation = vi.fn((key) => key);
    (useTranslation as Mock).mockReturnValue({ t: mockTranslation });
    (useServerConfigStore as Mock).mockReturnValue({ enableCommercialInbox: false });
    (useSessionStore as unknown as Mock).mockReturnValue([
      'Agent Title',
      'Agent Description',
      'avatar-url',
      true,
    ]);

    const { result } = renderHook(() => useInboxAgentMeta());

    expect(result.current).toEqual({
      avatar: 'avatar-url',
      description: 'inbox.desc',
      title: 'inbox.title',
    });
    expect(mockTranslation).toHaveBeenCalledWith('inbox.title');
    expect(mockTranslation).toHaveBeenCalledWith('inbox.desc');
  });

  it('should return correct meta for inbox session with commercial inbox enabled', () => {
    const mockTranslation = vi.fn((key, options) => `${key}-${options.ns}`);
    (useTranslation as Mock).mockReturnValue({ t: mockTranslation });
    (useServerConfigStore as Mock).mockReturnValue({ enableCommercialInbox: true });
    (useSessionStore as unknown as Mock).mockReturnValue([
      'Agent Title',
      'Agent Description',
      'avatar-url',
      true,
    ]);

    const { result } = renderHook(() => useInboxAgentMeta());

    expect(result.current).toEqual({
      avatar: 'avatar-url',
      description: 'chat.inbox.desc-custom',
      title: 'chat.inbox.title-custom',
    });
    expect(mockTranslation).toHaveBeenCalledWith('chat.inbox.title', { ns: 'custom' });
    expect(mockTranslation).toHaveBeenCalledWith('chat.inbox.desc', { ns: 'custom' });
  });
});
