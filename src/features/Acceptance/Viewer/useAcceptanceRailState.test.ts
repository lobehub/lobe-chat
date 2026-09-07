/** @vitest-environment happy-dom */
import { act, renderHook } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { describe, expect, it } from 'vitest';

import { OriginConversationProvider } from './originConversation';
import { useAcceptanceRailState } from './useAcceptanceRailState';

const TopicPanel = () => null;
const wrapper = ({ children }: { children: ReactNode }) =>
  createElement(OriginConversationProvider, { TopicPanel, children });

describe('useAcceptanceRailState', () => {
  it('reopens the source conversation after collapsing the rail', () => {
    const { result } = renderHook(
      () => useAcceptanceRailState({ focused: false, isNarrowViewport: false }),
      { wrapper },
    );
    act(() => result.current.originConversation?.openTopicDrawer('topic-1'));
    expect(result.current.expand).toBe(true);

    act(() => result.current.onExpandChange(false));
    expect(result.current.expand).toBe(false);
    expect(result.current.originConversation?.isOpen).toBe(false);

    act(() => result.current.originConversation?.openTopicDrawer('topic-1'));
    expect(result.current.expand).toBe(true);
  });
});
