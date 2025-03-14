import { afterEach, describe, expect, it, vi } from 'vitest';

import { MESSAGE_CANCEL_FLAT } from '@/const/message';
import { ChatMessageError } from '@/types/message';
import { sleep } from '@/utils/sleep';

import { FetchEventSourceInit } from '../fetchEventSource';
import { fetchEventSource } from '../fetchEventSource';
import { fetchSSE } from '../fetchSSE';

// Mock i18next
vi.mock('i18next', () => ({
  t: vi.fn((key) => `translated_${key}`),
}));

vi.mock('../fetchEventSource', () => ({
  fetchEventSource: vi.fn(),
}));

// Clean up mocks after each test
afterEach(() => {
  vi.restoreAllMocks();
});

describe('fetchSSE', () => {
  it('should handle base64_image event correctly', async () => {
    const mockOnMessageHandle = vi.fn();
    const mockOnFinish = vi.fn();
    const mockImageData = 'base64data';

    (fetchEventSource as any).mockImplementationOnce(
      (url: string, options: FetchEventSourceInit) => {
        options.onopen!({ clone: () => ({ ok: true, headers: new Headers() }) } as any);
        options.onmessage!({
          event: 'base64_image',
          data: JSON.stringify(mockImageData),
        } as any);
      },
    );

    await fetchSSE('/', {
      onMessageHandle: mockOnMessageHandle,
      onFinish: mockOnFinish,
    });

    expect(mockOnMessageHandle).toHaveBeenCalledWith({
      id: expect.stringMatching(/^tmp_img_/),
      image: {
        data: mockImageData,
        id: expect.stringMatching(/^tmp_img_/),
        isBase64: true,
      },
      images: expect.arrayContaining([
        expect.objectContaining({
          data: mockImageData,
          isBase64: true,
        }),
      ]),
      type: 'base64_image',
    });

    expect(mockOnFinish).toHaveBeenCalledWith('', {
      images: expect.arrayContaining([
        expect.objectContaining({
          data: mockImageData,
          isBase64: true,
        }),
      ]),
      observationId: null,
      traceId: null,
      type: 'done',
    });
  });

  it('should accumulate multiple base64_image events', async () => {
    const mockOnMessageHandle = vi.fn();
    const mockOnFinish = vi.fn();
    const mockImageData1 = 'base64data1';
    const mockImageData2 = 'base64data2';

    (fetchEventSource as any).mockImplementationOnce(
      (url: string, options: FetchEventSourceInit) => {
        options.onopen!({ clone: () => ({ ok: true, headers: new Headers() }) } as any);
        options.onmessage!({
          event: 'base64_image',
          data: JSON.stringify(mockImageData1),
        } as any);
        options.onmessage!({
          event: 'base64_image',
          data: JSON.stringify(mockImageData2),
        } as any);
      },
    );

    await fetchSSE('/', {
      onMessageHandle: mockOnMessageHandle,
      onFinish: mockOnFinish,
    });

    expect(mockOnMessageHandle).toHaveBeenCalledTimes(2);
    expect(mockOnFinish).toHaveBeenCalledWith('', {
      images: expect.arrayContaining([
        expect.objectContaining({
          data: mockImageData1,
          isBase64: true,
        }),
        expect.objectContaining({
          data: mockImageData2,
          isBase64: true,
        }),
      ]),
      observationId: null,
      traceId: null,
      type: 'done',
    });
  });

  it('should handle mixed text and base64_image events', async () => {
    const mockOnMessageHandle = vi.fn();
    const mockOnFinish = vi.fn();
    const mockImageData = 'base64data';

    (fetchEventSource as any).mockImplementationOnce(
      (url: string, options: FetchEventSourceInit) => {
        options.onopen!({ clone: () => ({ ok: true, headers: new Headers() }) } as any);
        options.onmessage!({ event: 'text', data: JSON.stringify('Hello') } as any);
        options.onmessage!({
          event: 'base64_image',
          data: JSON.stringify(mockImageData),
        } as any);
        options.onmessage!({ event: 'text', data: JSON.stringify(' World') } as any);
      },
    );

    await fetchSSE('/', {
      onMessageHandle: mockOnMessageHandle,
      onFinish: mockOnFinish,
      smoothing: false,
    });

    expect(mockOnFinish).toHaveBeenCalledWith('Hello World', {
      images: expect.arrayContaining([
        expect.objectContaining({
          data: mockImageData,
          isBase64: true,
        }),
      ]),
      observationId: null,
      traceId: null,
      type: 'done',
    });
  });

  // Keep existing tests below...
  it('should handle text event correctly', async () => {
    const mockOnMessageHandle = vi.fn();
    const mockOnFinish = vi.fn();

    (fetchEventSource as any).mockImplementationOnce(
      (url: string, options: FetchEventSourceInit) => {
        options.onopen!({ clone: () => ({ ok: true, headers: new Headers() }) } as any);
        options.onmessage!({ event: 'text', data: JSON.stringify('Hello') } as any);
        options.onmessage!({ event: 'text', data: JSON.stringify(' World') } as any);
      },
    );

    await fetchSSE('/', {
      onMessageHandle: mockOnMessageHandle,
      onFinish: mockOnFinish,
      smoothing: false,
    });

    expect(mockOnMessageHandle).toHaveBeenNthCalledWith(1, { text: 'Hello', type: 'text' });
    expect(mockOnMessageHandle).toHaveBeenNthCalledWith(2, { text: ' World', type: 'text' });
    expect(mockOnFinish).toHaveBeenCalledWith('Hello World', {
      observationId: null,
      toolCalls: undefined,
      traceId: null,
      type: 'done',
    });
  });

  // Rest of the existing tests...
});
