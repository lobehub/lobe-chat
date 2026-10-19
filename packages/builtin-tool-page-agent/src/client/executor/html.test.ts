import type { EditorRuntime } from '@lobechat/editor-runtime';
import type { BuiltinToolContext } from '@lobechat/types';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PageAgentExecutor } from './index';

const mocks = vi.hoisted(() => ({
  getDocumentById: vi.fn(),
  invalidateDocumentMutation: vi.fn().mockResolvedValue(undefined),
  updateDocument: vi.fn().mockResolvedValue({}),
}));

vi.mock('@/services/document', () => ({
  documentService: { getDocumentById: mocks.getDocumentById, updateDocument: mocks.updateDocument },
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
    mocks.getDocumentById.mockResolvedValue({ content: HTML, fileType: 'custom/html' });
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
});
