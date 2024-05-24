import { describe, expect, it, vi } from 'vitest';

import { isSonomaOrLaterSafari } from './platform';

describe('isSonomaOrLaterSafari', () => {
  beforeEach(() => {
    // 重置 navigator 对象
    vi.stubGlobal('navigator', {
      userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.4 Safari/605.1.15',
      maxTouchPoints: 0,
    });
  });

  it('should return false when userAgent is not Macintosh', () => {
    vi.stubGlobal('navigator', { userAgent: 'Windows NT 10.0; Win64; x64' });
    expect(isSonomaOrLaterSafari()).toBe(false);
  });

  it('should return false when navigator.maxTouchPoints > 0', () => {
    Object.defineProperty(navigator, 'maxTouchPoints', { value: 1 });
    expect(isSonomaOrLaterSafari()).toBe(false);
  });

  it('should return false when Safari version < 17', () => {
    vi.stubGlobal('navigator', {
      userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.4 Safari/605.1.15',
    });
    expect(isSonomaOrLaterSafari()).toBe(false);
  });

  it('should return false when audio codec check fails', () => {
    vi.stubGlobal('navigator', {
      userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
    });
    vi.spyOn(document, 'createElement').mockReturnValueOnce({
      canPlayType: vi.fn().mockReturnValue(''),
    } as any);
    vi.stubGlobal(
      'OffscreenCanvas',
      class {
        getContext = vi.fn().mockReturnValueOnce(null);
      },
    );
    expect(isSonomaOrLaterSafari()).toBe(false);
  });

  it('should return false when WebGL check fails', () => {
    vi.stubGlobal('navigator', {
      userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
    });
    vi.spyOn(document, 'createElement').mockReturnValueOnce({
      canPlayType: vi.fn().mockReturnValue('maybe'),
    } as any);
    vi.stubGlobal(
      'OffscreenCanvas',
      class {
        getContext = vi.fn().mockReturnValueOnce(null);
      },
    );
    expect(isSonomaOrLaterSafari()).toBe(false);
  });

  it('should return true when all checks pass', () => {
    vi.stubGlobal('navigator', {
      userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
    });
    vi.spyOn(document, 'createElement').mockReturnValueOnce({
      canPlayType: vi.fn().mockReturnValue('maybe'),
    } as any);
    vi.stubGlobal(
      'OffscreenCanvas',
      class {
        getContext = vi.fn().mockReturnValueOnce({});
      },
    );
    expect(isSonomaOrLaterSafari()).toBe(true);
  });
});
