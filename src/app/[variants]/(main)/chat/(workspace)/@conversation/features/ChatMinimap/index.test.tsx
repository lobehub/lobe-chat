import { act, fireEvent, render, screen } from '@testing-library/react';
import type { RefObject } from 'react';
import type { VirtuosoHandle } from 'react-virtuoso';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  setVirtuosoGlobalRef,
  setVirtuosoViewportRange,
} from '@/features/Conversation/components/VirtualizedList/VirtuosoContext';
import { useChatStore } from '@/store/chat';
import { initialState } from '@/store/chat/initialState';
import { messageMapKey } from '@/store/chat/utils/messageMapKey';
import type { ChatMessage } from '@/types/message';

import ChatMinimap from './index';

const setupMessages = (input: number | string[]) => {
  const now = Date.now();
  const sessionId = 'session';
  const key = messageMapKey(sessionId, null);

  const contents = Array.isArray(input)
    ? input
    : Array.from({ length: input }, (_, index) => `Message ${index}`);

  const messages: ChatMessage[] = contents.map((content, index) => ({
    content,
    createdAt: now + index,
    id: `msg-${index}`,
    meta: {},
    role: index % 2 === 0 ? 'user' : 'assistant',
    updatedAt: now + index,
  }));

  act(() => {
    useChatStore.setState(
      {
        ...initialState,
        activeId: sessionId,
        activeTopicId: null,
        messagesInit: true,
        messagesMap: {
          [key]: messages,
        },
      },
      true,
    );
  });
};

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  act(() => {
    setVirtuosoGlobalRef(null);
    setVirtuosoViewportRange(null);
  });
  vi.runOnlyPendingTimers();
  vi.useRealTimers();
});

describe('ChatMinimap', () => {
  it('should not render when message count is 4 or less', () => {
    setupMessages(4);

    render(<ChatMinimap />);

    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });

  it('should render one indicator per message when enabled', () => {
    const messages = ['short', 'medium length message', 'a'.repeat(240), 'b'.repeat(120), 'c', 'd'];
    setupMessages(messages);

    render(<ChatMinimap />);

    const indicatorButtons = screen.getAllByLabelText(/Jump to message/);
    const navigationButtons = screen.getAllByLabelText(/Jump to (previous|next) message/);

    expect(indicatorButtons).toHaveLength(messages.length);
    expect(navigationButtons).toHaveLength(2);

    const widths = indicatorButtons.map((button) => parseFloat(button.style.width || '0'));

    expect(Math.max(...widths)).toBeGreaterThan(Math.min(...widths));
  });

  it('should call scrollIntoView when a dot is clicked', () => {
    setupMessages(5);

    const scrollIntoView = vi.fn();
    const virtuosoRef = { current: { scrollIntoView } } as unknown as RefObject<VirtuosoHandle>;

    act(() => {
      setVirtuosoGlobalRef(virtuosoRef);
    });

    render(<ChatMinimap />);

    act(() => {
      setVirtuosoGlobalRef(virtuosoRef);
    });

    fireEvent.click(screen.getByLabelText('Jump to message 1'));

    expect(scrollIntoView).toHaveBeenCalledWith({ align: 'center', behavior: 'smooth', index: 0 });
  });

  it('should show message preview in tooltip', () => {
    const previewContent = 'Preview message content for tooltip';
    setupMessages([previewContent, 'another message', 'third message', 'four', 'five']);

    render(<ChatMinimap />);

    const button = screen.getByLabelText('Jump to message 1');

    fireEvent.mouseEnter(button);

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(screen.getByText(previewContent)).toBeInTheDocument();
  });

  it('should highlight current message and navigate using arrow controls', () => {
    setupMessages(10);

    const scrollIntoView = vi.fn();
    const virtuosoRef = ({ current: { scrollIntoView } } as unknown as RefObject<VirtuosoHandle>);

    act(() => {
      setVirtuosoGlobalRef(virtuosoRef);
      setVirtuosoViewportRange({ endIndex: 7, startIndex: 5 });
    });

    render(<ChatMinimap />);

    act(() => {
      setVirtuosoGlobalRef(virtuosoRef);
    });

    expect(screen.getByLabelText('Jump to message 8')).toHaveAttribute('aria-current', 'true');

    fireEvent.click(screen.getByLabelText('Jump to previous message'));

    expect(scrollIntoView).toHaveBeenCalledWith({ align: 'center', behavior: 'smooth', index: 6 });

    scrollIntoView.mockClear();

    fireEvent.click(screen.getByLabelText('Jump to next message'));

    expect(scrollIntoView).toHaveBeenCalledWith({ align: 'center', behavior: 'smooth', index: 8 });
  });
});
