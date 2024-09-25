import { act, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useChatStore } from '@/store/chat';
import { useUserStore } from '@/store/user';

import InputArea from './TextArea';

let setExpandMock: (expand: boolean) => void;

beforeEach(() => {
  setExpandMock = vi.fn();
});

describe('<InputArea />', () => {
  it('renders the TextArea component correctly', () => {
    render(<InputArea />);
    const textArea = screen.getByRole('textbox');
    expect(textArea).toBeInTheDocument();
  });

  it('auto-focuses the TextArea component on mount', () => {
    render(<InputArea />);
    const textArea = screen.getByRole('textbox');

    // The document's active element should be the textarea if it was auto-focused
    expect(document.activeElement).toBe(textArea);
  });

  it('renders with correct placeholder text', () => {
    render(<InputArea setExpand={setExpandMock} />);
    const textArea = screen.getByPlaceholderText('sendPlaceholder');
    expect(textArea).toBeInTheDocument();
  });

  it('has the correct initial value', () => {
    render(<InputArea setExpand={setExpandMock} />);
    const textArea = screen.getByRole('textbox');
    expect(textArea).toHaveValue('');
  });

  describe('input behavior', () => {
    it('calls updateInputMessage on input change', async () => {
      const updateInputMessageMock = vi.fn();
      act(() => {
        useChatStore.setState({ updateInputMessage: updateInputMessageMock });
      });

      render(<InputArea />);

      const textArea = screen.getByRole('textbox');
      const newValue = 'New message';
      fireEvent.change(textArea, { target: { value: newValue } });

      expect(updateInputMessageMock).toHaveBeenCalledWith(newValue);
    });

    it('handles composition events for IME input correctly', () => {
      const updateInputMessageMock = vi.fn();
      act(() => {
        useChatStore.setState({ updateInputMessage: updateInputMessageMock });
      });

      render(<InputArea />);
      const textArea = screen.getByRole('textbox');

      // Start composition (IME input starts)
      fireEvent.compositionStart(textArea);
      fireEvent.change(textArea, { target: { value: '正在' } });
      expect(updateInputMessageMock).toHaveBeenCalledWith('正在');

      // End composition (IME input ends)
      fireEvent.compositionEnd(textArea);
      fireEvent.change(textArea, { target: { value: '正在输入' } });
      expect(updateInputMessageMock).toHaveBeenCalledWith('正在输入');
    });

    it('does not send a message when Enter is pressed during IME composition', () => {
      const updateInputMessageMock = vi.fn();
      act(() => {
        useChatStore.setState({ updateInputMessage: updateInputMessageMock });
      });

      render(<InputArea setExpand={setExpandMock} />);
      const textArea = screen.getByRole('textbox');

      // Start composition (IME input starts)
      fireEvent.compositionStart(textArea);

      // Simulate pressing Enter during IME composition
      fireEvent.keyDown(textArea, { code: 'Enter', key: 'Enter' });

      // Since we are in the middle of IME composition, the message should not be sent
      expect(setExpandMock).not.toHaveBeenCalled();
      expect(updateInputMessageMock).not.toHaveBeenCalled();

      // End composition (IME input ends)
      fireEvent.compositionEnd(textArea);

      // Now simulate pressing Enter after IME composition
      fireEvent.keyDown(textArea, { code: 'Enter', key: 'Enter' });

      // Since IME composition has ended, now the message should be sent
      expect(setExpandMock).toHaveBeenCalled();
      expect(updateInputMessageMock).toHaveBeenCalled();
    });

    it('updates the input message when TextArea loses focus', () => {
      const updateInputMessageMock = vi.fn();
      act(() => {
        useChatStore.setState({ updateInputMessage: updateInputMessageMock });
      });

      render(<InputArea setExpand={setExpandMock} />);
      const textArea = screen.getByRole('textbox');
      const newText = 'New input text';

      fireEvent.change(textArea, { target: { value: newText } });
      fireEvent.blur(textArea);

      expect(updateInputMessageMock).toHaveBeenCalledWith(newText);
    });
  });

  describe('leaving protect', () => {
    it('triggers a warning when trying to leave the page with unsaved input', () => {
      const beforeUnloadEvent = new Event('beforeunload', { cancelable: true });

      act(() => {
        useChatStore.setState({ inputMessage: 'Unsaved input' });
      });

      render(<InputArea />);

      // trigger beforeunload
      window.dispatchEvent(beforeUnloadEvent);

      // 检查 returnValue 是否被设置为 true，这是触发警告的标识
      expect(beforeUnloadEvent.returnValue).toBeTruthy();
    });

    it('does not trigger a warning when trying to leave the page with empty input', () => {
      act(() => {
        useChatStore.setState({ inputMessage: '' });
      });

      // 模拟 window.addEventListener 来捕获 beforeunload 事件处理程序
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
      const beforeUnloadHandler = vi.fn();

      addEventListenerSpy.mockImplementation((event, handler) => {
        // @ts-ignore
        if (event === 'beforeunload') {
          beforeUnloadHandler.mockImplementation(handler as any);
        }
      });

      // 渲染组件
      render(<InputArea />);

      // 触发 beforeunload 事件
      const event = new Event('beforeunload', { cancelable: true });
      window.dispatchEvent(event);

      // 检查 beforeunload 事件的处理程序是否没有被调用
      expect(beforeUnloadHandler).not.toHaveBeenCalled();

      // 清理模拟
      addEventListenerSpy.mockRestore();
    });

    describe('cleanup', () => {
      it('removes beforeunload listener on unmount', () => {
        const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
        const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

        // 渲染并立即卸载组件
        const { unmount } = render(<InputArea />);
        unmount();

        // 检查是否为 beforeunload 事件添加了监听器
        expect(addEventListenerSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function));

        // 检查是否移除了对应的监听器
        expect(removeEventListenerSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function));

        // 清理 spy
        addEventListenerSpy.mockRestore();
        removeEventListenerSpy.mockRestore();
      });
    });
  });

  describe('message sending behavior', () => {
    it('does not send message when loading or shift key is pressed', () => {
      const sendMessageMock = vi.fn();
      act(() => {
        useChatStore.setState({ chatLoadingIds: ['123'], sendMessage: sendMessageMock });
      });

      render(<InputArea setExpand={setExpandMock} />);
      const textArea = screen.getByRole('textbox');

      fireEvent.keyDown(textArea, { code: 'Enter', key: 'Enter', shiftKey: true });
      expect(sendMessageMock).not.toHaveBeenCalled();
    });

    it('sends message on Enter press when not loading and no shift key', () => {
      const sendMessageMock = vi.fn();
      act(() => {
        useChatStore.setState({
          chatLoadingIds: [],
          inputMessage: 'abc',
          sendMessage: sendMessageMock,
        });
      });

      render(<InputArea />);
      const textArea = screen.getByRole('textbox');
      fireEvent.change(textArea, { target: { value: 'Test message' } });

      fireEvent.keyDown(textArea, { code: 'Enter', key: 'Enter' });
      expect(sendMessageMock).toHaveBeenCalled();
    });

    describe('metaKey behavior for sending messages', () => {
      it('windows: sends message on ctrl + enter when useCmdEnterToSend is true', () => {
        const sendMessageMock = vi.fn();
        act(() => {
          useChatStore.setState({
            chatLoadingIds: [],
            inputMessage: '123',
            sendMessage: sendMessageMock,
          });
          useUserStore.getState().updatePreference({ useCmdEnterToSend: true });
        });

        render(<InputArea setExpand={setExpandMock} />);
        const textArea = screen.getByRole('textbox');

        fireEvent.keyDown(textArea, { code: 'Enter', ctrlKey: true, key: 'Enter' });
        expect(sendMessageMock).toHaveBeenCalled();
      });

      it('windows: inserts a new line on ctrl + enter when useCmdEnterToSend is false', () => {
        const sendMessageMock = vi.fn();
        const updateInputMessageMock = vi.fn();
        act(() => {
          useChatStore.setState({
            chatLoadingIds: [],
            inputMessage: 'Test',
            sendMessage: sendMessageMock,
            updateInputMessage: updateInputMessageMock,
          });
          useUserStore.getState().updatePreference({ useCmdEnterToSend: false });
        });

        render(<InputArea setExpand={setExpandMock} />);
        const textArea = screen.getByRole('textbox');

        fireEvent.keyDown(textArea, { code: 'Enter', ctrlKey: true, key: 'Enter' });
        expect(updateInputMessageMock).toHaveBeenCalledWith('Test\n');
        expect(sendMessageMock).not.toHaveBeenCalled(); // sendMessage should not be called
      });

      it('macOS: sends message on cmd + enter when useCmdEnterToSend is true', () => {
        vi.stubGlobal('navigator', {
          userAgent:
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        });
        const sendMessageMock = vi.fn();
        act(() => {
          useChatStore.setState({
            chatLoadingIds: [],
            inputMessage: '123',
            sendMessage: sendMessageMock,
          });
          useUserStore.getState().updatePreference({ useCmdEnterToSend: true });
        });

        render(<InputArea setExpand={setExpandMock} />);
        const textArea = screen.getByRole('textbox');

        fireEvent.keyDown(textArea, { code: 'Enter', key: 'Enter', metaKey: true });
        expect(sendMessageMock).toHaveBeenCalled();
        vi.restoreAllMocks();
      });

      it('macOS: inserts a new line on cmd + enter when useCmdEnterToSend is false', () => {
        vi.stubGlobal('navigator', {
          userAgent:
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        });
        const sendMessageMock = vi.fn();
        const updateInputMessageMock = vi.fn();
        act(() => {
          useChatStore.setState({
            chatLoadingIds: [],
            inputMessage: 'Test',
            sendMessage: sendMessageMock,
            updateInputMessage: updateInputMessageMock,
          });
          useUserStore.getState().updatePreference({ useCmdEnterToSend: false });
        });

        render(<InputArea setExpand={setExpandMock} />);
        const textArea = screen.getByRole('textbox');

        fireEvent.keyDown(textArea, { code: 'Enter', key: 'Enter', metaKey: true });
        expect(updateInputMessageMock).toHaveBeenCalledWith('Test\n');
        expect(sendMessageMock).not.toHaveBeenCalled(); // sendMessage should not be called
        vi.restoreAllMocks();
      });
    });
  });
});
