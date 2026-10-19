import type { EditorRuntime } from '@lobechat/editor-runtime';
import type { BuiltinToolContext } from '@lobechat/types';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PageAgentExecutor } from './index';

const mocks = vi.hoisted(() => ({
  documents: {} as Record<string, { lockOwnerId?: string }>,
  getDocumentById: vi.fn(),
  invalidateDocumentMutation: vi.fn().mockResolvedValue(undefined),
  updateDocument: vi.fn().mockResolvedValue({}),
}));

vi.mock('@/services/document', () => ({
  documentService: { getDocumentById: mocks.getDocumentById, updateDocument: mocks.updateDocument },
}));
vi.mock('@/store/document', () => ({
  getDocumentStoreState: () => ({ documents: mocks.documents }),
}));
vi.mock('@/services/document/invalidation', () => ({
  invalidateDocumentMutation: mocks.invalidateDocumentMutation,
}));

const HTML = '<!doctype html><html><body><p>12</p></body></html>';
const ctx = { documentId: 'page-1' } as BuiltinToolContext;

describe('PageAgentExecutor on an HTML page', () => {
  let executor: PageAgentExecutor;

  beforeEach(() => {
    vi.clearAllMocks();
    // An HTML page mounts no Lexical editor, so the runtime is never ready.
    executor = new PageAgentExecutor({
      getCurrentDocId: vi.fn(() => undefined),
      getDebugSnapshot: vi.fn(() => ({})),
      isReady: vi.fn(() => false),
    } as unknown as EditorRuntime);
    mocks.documents = {};
    mocks.getDocumentById.mockResolvedValue({
      content: HTML,
      fileType: 'custom/html',
      updatedAt: new Date('2026-10-19T00:00:00Z'),
    });
  });

  it('edits the stored HTML without a mounted editor and refreshes the page', async () => {
    const result = await executor.invoke(
      'editHtml',
      { newString: '<p>13</p>', oldString: '<p>12</p>' },
      ctx,
    );

    expect(result.success).toBe(true);
    expect(mocks.updateDocument).toHaveBeenCalledWith({
      content: HTML.replace('<p>12</p>', '<p>13</p>'),
      expectedUpdatedAt: new Date('2026-10-19T00:00:00Z'),
      id: 'page-1',
    });

    // A client-run tool gets no `onAfterCall` (only gateway tool_end events do):
    // the write itself refreshes the page's frame.
    expect(mocks.invalidateDocumentMutation).toHaveBeenCalledWith({ documentId: 'page-1' });
  });

  it('reads the HTML without writing', async () => {
    const result = await executor.invoke('readHtml', {}, ctx);

    expect(result).toMatchObject({ content: HTML, success: true });
    expect(mocks.updateDocument).not.toHaveBeenCalled();
    expect(mocks.invalidateDocumentMutation).not.toHaveBeenCalled();
  });

  it('refuses a rich-text page', async () => {
    mocks.getDocumentById.mockResolvedValue({ content: '# Notes', fileType: 'custom/document' });

    const result = await executor.invoke('writeHtml', { html: '<p>x</p>' }, ctx);

    expect(result.success).toBe(false);
    expect(result.content).toMatch(/rich-text page/);
    expect(mocks.updateDocument).not.toHaveBeenCalled();
  });

  it('still blocks node APIs, which need the editor', async () => {
    const result = await executor.invoke('modifyNodes', { operations: [] }, ctx);

    expect(result.success).toBe(false);
    expect(result.error?.type).toBe('PageEditorNotMounted');
  });

  it('applies concurrent edits of one page in turn, so none is lost', async () => {
    // A stored page the mocked service reads and writes, with network latency.
    let stored = '<p>a</p><p>b</p>';
    const tick = () => new Promise((resolve) => setTimeout(resolve, 5));
    mocks.getDocumentById.mockImplementation(async () => {
      const snapshot = stored;
      await tick();
      return { content: snapshot, fileType: 'custom/html' };
    });
    mocks.updateDocument.mockImplementation(async ({ content }: { content: string }) => {
      await tick();
      stored = content;
      return {};
    });

    // The gateway starts every tool call of one step at once.
    const results = await Promise.all([
      executor.invoke('editHtml', { newString: '<p>A</p>', oldString: '<p>a</p>' }, ctx),
      executor.invoke('editHtml', { newString: '<p>B</p>', oldString: '<p>b</p>' }, ctx),
    ]);

    expect(results.every((result) => result.success)).toBe(true);
    expect(stored).toBe('<p>A</p><p>B</p>');
  });

  it('saves under the edit lock this page holds', async () => {
    // A shared workspace page: the open editor holds an owner-scoped lease.
    mocks.documents = { 'page-1': { lockOwnerId: 'session-1' } };

    await executor.invoke('editHtml', { newString: '<p>13</p>', oldString: '<p>12</p>' }, ctx);

    expect(mocks.updateDocument).toHaveBeenCalledWith(
      expect.objectContaining({ lockOwnerId: 'session-1' }),
    );
  });

  it('re-applies an edit when another tab saved the page in between', async () => {
    const otherTab = HTML.replace('<body>', '<body><h1>Report</h1>');
    mocks.getDocumentById
      .mockResolvedValueOnce({ content: HTML, fileType: 'custom/html', updatedAt: new Date(1) })
      // Re-read after the conflict, then the retry's read.
      .mockResolvedValue({ content: otherTab, fileType: 'custom/html', updatedAt: new Date(2) });
    mocks.updateDocument
      .mockRejectedValueOnce(Object.assign(new Error('conflict'), { data: { code: 'CONFLICT' } }))
      .mockResolvedValueOnce({});

    const result = await executor.invoke(
      'editHtml',
      { newString: '<p>13</p>', oldString: '<p>12</p>' },
      ctx,
    );

    expect(result.success).toBe(true);
    expect(mocks.updateDocument).toHaveBeenLastCalledWith(
      expect.objectContaining({
        content: otherTab.replace('<p>12</p>', '<p>13</p>'),
        expectedUpdatedAt: new Date(2),
      }),
    );
  });

  it('reports a page locked by someone else instead of retrying', async () => {
    mocks.updateDocument.mockRejectedValue(
      Object.assign(new Error('Document is being edited by another user'), {
        data: { code: 'CONFLICT' },
      }),
    );

    const result = await executor.invoke(
      'editHtml',
      { newString: '<p>13</p>', oldString: '<p>12</p>' },
      ctx,
    );

    // Same version on re-read: the conflict is the lock, not a newer write.
    expect(result.success).toBe(false);
    expect(mocks.updateDocument).toHaveBeenCalledTimes(1);
  });
});
