/**
 * @vitest-environment happy-dom
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { confirmRemoveTopic } from './index';

const confirmModalMock = vi.hoisted(() => vi.fn());

vi.mock('@lobehub/ui', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  confirmModal: confirmModalMock,
}));

vi.mock('i18next', () => ({
  t: (key: string) => key,
}));

describe('confirmRemoveTopic', () => {
  beforeEach(() => {
    confirmModalMock.mockReset();
  });

  // Regression: the dialog used to wait on an attachment lookup with a 500ms
  // fallback, so a slow lookup showed a file option for topics without files.
  it('opens synchronously with a fixed description and no attachment choice', () => {
    confirmRemoveTopic({ onConfirm: vi.fn() });

    expect(confirmModalMock).toHaveBeenCalledTimes(1);
    expect(confirmModalMock.mock.calls[0][0].content).toBe('actions.confirmRemoveTopic');
  });

  it('runs the confirm callback on ok', async () => {
    const onConfirm = vi.fn();
    confirmRemoveTopic({ onConfirm });

    await confirmModalMock.mock.calls[0][0].onOk();

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('uses caller-provided copy', () => {
    confirmRemoveTopic({ content: 'bulk', okText: 'ok', onConfirm: vi.fn(), title: 'title' });

    expect(confirmModalMock.mock.calls[0][0]).toMatchObject({
      content: 'bulk',
      okText: 'ok',
      title: 'title',
    });
  });
});
