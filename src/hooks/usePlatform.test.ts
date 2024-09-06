import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import * as platformUtils from '@/utils/platform';

import { usePlatform } from './usePlatform';

// Mocks
vi.mock('@/utils/platform', () => ({
  getBrowser: vi.fn(),
  getPlatform: vi.fn(),
  isInStandaloneMode: vi.fn(),
  isSonomaOrLaterSafari: vi.fn(),
}));

describe('usePlatform', () => {
  it('should return correct platform info for Mac OS and Chrome', () => {
    vi.mocked(platformUtils.getPlatform).mockReturnValue('Mac OS');
    vi.mocked(platformUtils.getBrowser).mockReturnValue('Chrome');
    vi.mocked(platformUtils.isInStandaloneMode).mockReturnValue(false);
    vi.mocked(platformUtils.isSonomaOrLaterSafari).mockReturnValue(false);

    const { result } = renderHook(() => usePlatform());

    expect(result.current).toEqual({
      isApple: true,
      isChrome: true,
      isChromium: true,
      isEdge: false,
      isIOS: false,
      isMacOS: true,
      isPWA: false,
      isSafari: false,
      isSonomaOrLaterSafari: false,
      isSupportInstallPWA: true,
    });
  });

  it('should return correct platform info for iOS and Safari', () => {
    vi.mocked(platformUtils.getPlatform).mockReturnValue('iOS');
    vi.mocked(platformUtils.getBrowser).mockReturnValue('Safari');
    vi.mocked(platformUtils.isInStandaloneMode).mockReturnValue(true);
    vi.mocked(platformUtils.isSonomaOrLaterSafari).mockReturnValue(true);

    const { result } = renderHook(() => usePlatform());

    expect(result.current).toEqual({
      isApple: true,
      isChrome: false,
      isChromium: false,
      isEdge: false,
      isIOS: true,
      isMacOS: false,
      isPWA: true,
      isSafari: true,
      isSonomaOrLaterSafari: true,
      isSupportInstallPWA: false,
    });
  });

  it('should return correct platform info for Windows and Edge', () => {
    vi.mocked(platformUtils.getPlatform).mockReturnValue('Windows');
    vi.mocked(platformUtils.getBrowser).mockReturnValue('Edge');
    vi.mocked(platformUtils.isInStandaloneMode).mockReturnValue(false);
    vi.mocked(platformUtils.isSonomaOrLaterSafari).mockReturnValue(false);

    const { result } = renderHook(() => usePlatform());

    expect(result.current).toEqual({
      isApple: false,
      isChrome: false,
      isChromium: true,
      isEdge: true,
      isIOS: false,
      isMacOS: false,
      isPWA: false,
      isSafari: false,
      isSonomaOrLaterSafari: false,
      isSupportInstallPWA: true,
    });
  });
});
