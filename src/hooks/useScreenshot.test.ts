// @vitest-environment happy-dom
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getImageUrl, ImageType } from './useScreenshot';

const snapdomMocks = vi.hoisted(() => {
  const toBlob = vi.fn();
  const toRaw = vi.fn();
  return {
    snapdom: vi.fn(() => ({ toRaw })),
    toBlob,
    toRaw,
  };
});

vi.mock('@zumer/snapdom', () => ({
  snapdom: Object.assign(snapdomMocks.snapdom, { toBlob: snapdomMocks.toBlob }),
}));

vi.mock('@lobechat/business-const', () => ({
  BRANDING_NAME: 'LobeHub',
}));

describe('getImageUrl — snapdom options invariant', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    snapdomMocks.toBlob.mockResolvedValue(new Blob(['x'], { type: 'image/png' }));
    snapdomMocks.toRaw.mockReturnValue('<svg></svg>');
  });

  it('does not pass useProxy to snapdom.toBlob (no third-party proxy)', async () => {
    document.body.innerHTML = '<div id="preview"><img src="data:image/png;base64,aaa"/></div>';

    await getImageUrl({ imageType: ImageType.PNG });

    expect(snapdomMocks.toBlob).toHaveBeenCalledTimes(1);
    const options = snapdomMocks.toBlob.mock.calls[0][1] as Record<string, unknown>;
    expect(options.useProxy).toBeUndefined();
  });

  it('passes placeholders: false to snapdom.toBlob', async () => {
    document.body.innerHTML = '<div id="preview"><img src="data:image/png;base64,aaa"/></div>';

    await getImageUrl({ imageType: ImageType.PNG });

    expect(snapdomMocks.toBlob).toHaveBeenCalledTimes(1);
    const options = snapdomMocks.toBlob.mock.calls[0][1] as Record<string, unknown>;
    expect(options.placeholders).toBe(false);
  });

  it('does not pass useProxy for JPG either', async () => {
    document.body.innerHTML = '<div id="preview"><img src="data:image/png;base64,aaa"/></div>';

    await getImageUrl({ imageType: ImageType.JPG });

    expect(snapdomMocks.toBlob).toHaveBeenCalledTimes(1);
    const options = snapdomMocks.toBlob.mock.calls[0][1] as Record<string, unknown>;
    expect(options.useProxy).toBeUndefined();
    expect(options.placeholders).toBe(false);
  });
});
