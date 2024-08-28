import { act, renderHook } from '@testing-library/react';
import { Mock, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getContainer, useDragUpload } from './useDragUpload';

describe('useDragUpload', () => {
  let mockOnUploadFiles: Mock;

  beforeEach(() => {
    mockOnUploadFiles = vi.fn();
    vi.useFakeTimers();
    document.body.innerHTML = '';
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('should initialize and cleanup correctly', () => {
    const { result, unmount } = renderHook(() => useDragUpload(mockOnUploadFiles));

    expect(result.current).toBe(false);
    expect(document.getElementById('dragging-root')).not.toBeNull();

    unmount();

    expect(document.getElementById('dragging-root')).toBeNull();
  });

  it('should handle drag events correctly', () => {
    const { result } = renderHook(() => useDragUpload(mockOnUploadFiles));

    act(() => {
      window.dispatchEvent(new Event('dragenter'));
    });

    expect(result.current).toBe(false);

    act(() => {
      const dragEnterEvent = new Event('dragenter') as DragEvent;
      Object.defineProperty(dragEnterEvent, 'dataTransfer', {
        value: {
          items: [{}],
          types: ['Files'],
        },
      });
      window.dispatchEvent(dragEnterEvent);
    });

    expect(result.current).toBe(true);

    act(() => {
      const dragLeaveEvent = new Event('dragleave') as DragEvent;
      Object.defineProperty(dragLeaveEvent, 'dataTransfer', {
        value: {
          items: [{}],
          types: ['Files'],
        },
      });
      window.dispatchEvent(dragLeaveEvent);
    });

    expect(result.current).toBe(false);
  });

  it('should handle file drop', async () => {
    renderHook(() => useDragUpload(mockOnUploadFiles));

    const mockFile = new File([''], 'test.txt', { type: 'text/plain' });
    const dropEvent = new Event('drop') as DragEvent;
    Object.defineProperty(dropEvent, 'dataTransfer', {
      value: {
        items: [
          {
            kind: 'file',
            getAsFile: () => mockFile,
            webkitGetAsEntry: () => ({
              isFile: true,
              file: (cb: (file: File) => void) => cb(mockFile),
            }),
          },
        ],
        types: ['Files'],
      },
    });

    await act(async () => {
      window.dispatchEvent(dropEvent);
    });

    expect(mockOnUploadFiles).toHaveBeenCalledWith([mockFile]);
  });

  it('should handle paste event', async () => {
    renderHook(() => useDragUpload(mockOnUploadFiles));

    const mockFile = new File([''], 'test.txt', { type: 'text/plain' });
    const pasteEvent = new Event('paste') as ClipboardEvent;
    Object.defineProperty(pasteEvent, 'clipboardData', {
      value: {
        items: [
          {
            kind: 'file',
            getAsFile: () => mockFile,
            webkitGetAsEntry: () => null,
          },
        ],
      },
    });

    await act(async () => {
      window.dispatchEvent(pasteEvent);
    });

    expect(mockOnUploadFiles).toHaveBeenCalledWith([mockFile]);
  });
});

describe('getContainer', () => {
  it('should return the dragging root element', () => {
    const rootElement = document.createElement('div');
    rootElement.id = 'dragging-root';
    document.body.appendChild(rootElement);

    const container = getContainer();
    expect(container).not.toBeNull();
    expect(container?.id).toBe('dragging-root');
  });
});
