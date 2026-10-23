import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { CanvasVersionDetail } from '@/services/canvas';

import { useCanvasPublishItems } from './useCanvasPublishItems';

const mocks = vi.hoisted(() => ({
  openPublishConfirm: vi.fn(),
  publish: vi.fn(),
  refreshAllConversations: vi.fn(),
}));

vi.mock('@/components/PublishConfirmModal', () => ({
  openPublishConfirm: mocks.openPublishConfirm,
}));
vi.mock('@/services/canvas', () => ({ canvasService: { publish: mocks.publish } }));
vi.mock('@/services/work', () => ({
  workService: { refreshAllConversations: mocks.refreshAllConversations },
}));

const detail = (overrides: Partial<CanvasVersionDetail> = {}) =>
  ({
    canPublish: true,
    canvasId: 'cvs_1',
    latestVersion: 2,
    publishedUrl: null,
    publishedVersion: null,
    ...overrides,
  }) as unknown as CanvasVersionDetail;

const clickPublish = (data: CanvasVersionDetail, onPublished = vi.fn()) => {
  const { result } = renderHook(() => useCanvasPublishItems(data, onPublished));
  const item = result.current.find((entry) => entry && 'key' in entry && entry.key === 'publish');
  act(() => {
    (item as { onClick: () => void }).onClick();
  });
};

beforeEach(() => {
  vi.clearAllMocks();
  mocks.publish.mockResolvedValue({ publishedVersion: 2 });
});

describe('useCanvasPublishItems', () => {
  it('asks for confirmation before a canvas becomes public', () => {
    clickPublish(detail());

    expect(mocks.publish).not.toHaveBeenCalled();
    expect(mocks.openPublishConfirm).toHaveBeenCalledWith(
      expect.objectContaining({ okText: 'canvas.menu.publish', note: 'canvas.publish.note' }),
    );
  });

  it('publishes once the confirmation is accepted', async () => {
    const onPublished = vi.fn();
    clickPublish(detail(), onPublished);

    await act(async () => {
      mocks.openPublishConfirm.mock.calls[0][0].onOk();
    });

    expect(mocks.publish).toHaveBeenCalledWith('cvs_1');
    expect(onPublished).toHaveBeenCalled();
  });

  it('confirms updating an existing public link as well', () => {
    clickPublish(detail({ publishedUrl: 'https://cost.lobehub.sites', publishedVersion: 1 }));

    expect(mocks.openPublishConfirm).toHaveBeenCalledWith(
      expect.objectContaining({ okText: 'canvas.menu.updatePublic' }),
    );
    expect(mocks.publish).not.toHaveBeenCalled();
  });
});
