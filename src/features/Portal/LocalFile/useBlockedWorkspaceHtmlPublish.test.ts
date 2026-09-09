import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useBlockedWorkspaceHtmlPublish } from './useBlockedWorkspaceHtmlPublish';

const mocks = vi.hoisted(() => ({
  copy: vi.fn(),
  confirmModal: vi.fn(),
  debugLog: vi.fn(),
  notifyBlocked: vi.fn(),
  openConfirm: vi.fn(),
  prepare: vi.fn(),
  publishPrepared: vi.fn(),
  toastError: vi.fn(),
  translate: vi.fn((key: string, _options?: Record<string, unknown>) => key),
}));

vi.mock('debug', () => ({ default: () => mocks.debugLog }));

vi.mock('@lobehub/ui/base-ui', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  confirmModal: (...args: unknown[]) => mocks.confirmModal(...args),
  toast: { error: (...args: unknown[]) => mocks.toastError(...args) },
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) => mocks.translate(key, options),
  }),
}));
vi.mock('./copyWorkspaceHtmlArtifactIntoWorkspace', () => ({
  copyWorkspaceHtmlArtifactIntoWorkspace: (...args: unknown[]) => mocks.copy(...args),
}));
vi.mock('./prepareWorkspaceHtmlPublish', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  notifyWorkspaceHtmlPublishBlocked: (...args: unknown[]) => mocks.notifyBlocked(...args),
  prepareWorkspaceHtmlPublish: (...args: unknown[]) => mocks.prepare(...args),
  publishPreparedWorkspaceHtml: (...args: unknown[]) => mocks.publishPrepared(...args),
}));
vi.mock('./PublishHtmlArtifactConfirm', () => ({
  openWorkspaceHtmlPublishConfirm: (...args: unknown[]) => mocks.openConfirm(...args),
}));

const ready = {
  gathered: { identifier: 'copied', title: 'Demo' },
  packed: { html: '<html></html>', inlinedPaths: [], sidecars: [], unresolvedHrefs: [] },
} as never;

const input = {
  close: vi.fn(),
  copyFile: vi.fn(),
  filePath: '/tmp/site/index.html',
  hasExisting: false,
  plan: {
    blocked: 'outside-workspace' as const,
    escaped: [{ absolutePath: '/tmp/site/logo.png', href: 'logo.png' }],
    gathered: {
      entryPath: 'index.html',
      files: [
        {
          content: '<html><img src="logo.png"></html>',
          contentType: 'text/html',
          encoding: 'utf8' as const,
          path: 'index.html',
        },
      ],
    } as never,
  },
  publish: vi.fn(),
  topicId: 'topic-1',
  workingDirectory: '/project',
};

describe('useBlockedWorkspaceHtmlPublish', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.publishPrepared.mockResolvedValue({ id: 'published' });
  });

  it('copies, prepares from the new entry, and opens the normal privacy confirm', async () => {
    mocks.copy.mockResolvedValue({
      entryPath: '/project/.lobe-artifacts/copied/index.html',
      failed: [],
      htmlContent: '<html><img src="logo.png"></html>',
      targetDirectory: '/project/.lobe-artifacts/copied',
    });
    mocks.prepare.mockResolvedValue(ready);
    const { result } = renderHook(() => useBlockedWorkspaceHtmlPublish(input));

    await act(() => result.current.handleContinue());

    expect(mocks.copy).toHaveBeenCalledWith(
      expect.objectContaining({ htmlFilePath: '/tmp/site/index.html' }),
    );
    expect(mocks.prepare).toHaveBeenCalledWith(
      expect.objectContaining({ filePath: '/project/.lobe-artifacts/copied/index.html' }),
    );
    expect(mocks.openConfirm).toHaveBeenCalledOnce();

    mocks.openConfirm.mock.calls[0][0].onOk();
    expect(mocks.publishPrepared).toHaveBeenCalledWith(
      expect.objectContaining({
        plan: ready,
        successMessage: 'workingPanel.localFile.publish.outsideWorkspace.copiedToast',
        topicId: 'topic-1',
      }),
    );
  });

  it('keeps copy failures in the blocked modal and does not continue preparing', async () => {
    const failed = [{ absolutePath: '/tmp/site/logo.png', href: 'logo.png' }];
    mocks.copy.mockResolvedValue({ failed });
    const { result } = renderHook(() => useBlockedWorkspaceHtmlPublish(input));

    await act(() => result.current.handleContinue());

    expect(result.current.failed).toEqual(failed);
    expect(mocks.prepare).not.toHaveBeenCalled();
    expect(mocks.openConfirm).not.toHaveBeenCalled();
  });

  it('requires warning confirmation before preparing external reads and performs no copy', async () => {
    mocks.prepare.mockResolvedValue(ready);
    const { result } = renderHook(() => useBlockedWorkspaceHtmlPublish(input));

    act(() => result.current.handleForceChange(true));
    expect(result.current.force).toBe(false);

    const warning = mocks.confirmModal.mock.calls[0][0];
    expect(warning).toEqual(
      expect.objectContaining({
        content: 'workingPanel.localFile.publish.outsideWorkspace.forceHint',
        okButtonProps: { danger: true },
        okText: 'confirm',
        title: 'workingPanel.localFile.publish.outsideWorkspace.forceLabel',
      }),
    );

    act(() => warning.onOk());
    expect(result.current.force).toBe(true);

    await act(() => result.current.handleContinue());

    expect(mocks.copy).not.toHaveBeenCalled();
    expect(mocks.prepare).toHaveBeenCalledWith(
      expect.objectContaining({
        allowExternalReads: true,
        filePath: '/tmp/site/index.html',
      }),
    );
    expect(mocks.openConfirm).toHaveBeenCalledOnce();
  });

  it('lets prepare reload a non-utf8 entry instead of publishing empty HTML', async () => {
    mocks.prepare.mockResolvedValue(ready);
    const nonUtf8Input = {
      ...input,
      plan: {
        ...input.plan,
        gathered: {
          entryPath: 'index.html',
          files: [
            {
              content: 'PGh0bWw+PC9odG1sPg==',
              contentType: 'text/html',
              encoding: 'base64' as const,
              path: 'index.html',
            },
          ],
        } as never,
      },
    };
    const { result } = renderHook(() => useBlockedWorkspaceHtmlPublish(nonUtf8Input));

    act(() => result.current.handleForceChange(true));
    act(() => mocks.confirmModal.mock.calls[0][0].onOk());
    await act(() => result.current.handleContinue());

    expect(mocks.prepare).toHaveBeenCalledWith(expect.objectContaining({ content: undefined }));
  });

  it('keeps an entry-copy failure retryable and out of escaped failures', async () => {
    mocks.copy.mockRejectedValue(new Error('entry gone'));
    const { result } = renderHook(() => useBlockedWorkspaceHtmlPublish(input));

    await act(() => result.current.handleContinue());

    expect(result.current.failed).toEqual([]);
    expect(mocks.toastError).toHaveBeenCalledOnce();
    expect(mocks.translate).toHaveBeenCalledWith(
      'workingPanel.localFile.publish.outsideWorkspace.copyFailedEntry',
      { ns: 'chat' },
    );

    await act(() => result.current.handleContinue());
    expect(mocks.copy).toHaveBeenCalledTimes(2);
  });

  it('explains when a second prepare is still blocked outside the workspace', async () => {
    mocks.prepare.mockResolvedValue(input.plan);
    const { result } = renderHook(() => useBlockedWorkspaceHtmlPublish(input));

    act(() => result.current.handleForceChange(true));
    act(() => mocks.confirmModal.mock.calls[0][0].onOk());
    await act(() => result.current.handleContinue());

    expect(mocks.translate).toHaveBeenCalledWith(
      'workingPanel.localFile.publish.outsideWorkspace.stillBlocked',
      { ns: 'chat' },
    );
    expect(mocks.debugLog).toHaveBeenCalledWith(expect.any(String), ['/tmp/site/logo.png']);
  });
});
