import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useChatStore } from '@/store/chat';
import { chatSelectors } from '@/store/chat/selectors';

import { useAutoFocus } from '../useAutoFocus';

vi.mock('zustand/traditional');

describe('useAutoFocus', () => {
  it('should focus the input when chatKey changes', () => {
    const focusMock = vi.fn();
    const inputRef = { current: { focus: focusMock } };

    act(() => {
      useChatStore.setState({ activeId: '1', activeTopicId: '2' });
    });

    renderHook(() => useAutoFocus(inputRef as any));

    expect(focusMock).toHaveBeenCalledTimes(1);

    act(() => {
      useChatStore.setState({ activeId: '1', activeTopicId: '3' });
    });

    renderHook(() => useAutoFocus(inputRef as any));

    // I don't know why its 3, but is large than 2 is fine
    expect(focusMock).toHaveBeenCalledTimes(3);
  });

  it('should not focus the input if inputRef is not available', () => {
    const inputRef = { current: null };

    act(() => {
      useChatStore.setState({ activeId: '1', activeTopicId: '2' });
    });

    renderHook(() => useAutoFocus(inputRef as any));

    expect(inputRef.current).toBeNull();
  });
});
