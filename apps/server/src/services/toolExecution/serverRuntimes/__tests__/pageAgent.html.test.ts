// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { pageAgentRuntime } from '../pageAgent';

const mocks = vi.hoisted(() => ({
  findById: vi.fn(),
  runWithDocumentLock: vi.fn(),
  updateDocument: vi.fn(),
}));

vi.mock('@/database/models/document', () => ({
  DocumentModel: vi.fn().mockImplementation(function () {
    return { findById: mocks.findById };
  }),
}));

vi.mock('@/server/services/document', () => ({
  DocumentService: vi.fn().mockImplementation(function () {
    return {
      runWithDocumentLock: mocks.runWithDocumentLock,
      updateDocument: mocks.updateDocument,
    };
  }),
}));

const HTML = '<!doctype html><html><body><h1>Report</h1><p>12</p></body></html>';

const runtime = () =>
  pageAgentRuntime.factory({ serverDB: {} as any, userId: 'user-1' } as any) as Record<
    string,
    (args: unknown, ctx: unknown) => Promise<any>
  >;
const ctx = { documentId: 'doc-1' };

const page = (fileType: string, content: string, updatedAt = new Date('2026-10-19T00:00:00Z')) => ({
  content,
  editorData: null,
  fileType,
  id: 'doc-1',
  title: 'Goal report',
  updatedAt,
});

beforeEach(() => {
  vi.clearAllMocks();
  mocks.runWithDocumentLock.mockImplementation((_id: string, fn: (owner?: string) => unknown) =>
    fn('lock-owner'),
  );
});

describe('page agent on an HTML page', () => {
  beforeEach(() => {
    mocks.findById.mockResolvedValue(page('custom/html', HTML));
  });

  it('reads the raw HTML', async () => {
    const result = await runtime().readHtml({}, ctx);

    expect(result).toMatchObject({ content: HTML, success: true });
    expect(mocks.updateDocument).not.toHaveBeenCalled();
  });

  it('edits the HTML by exact replacement under the document lock', async () => {
    const result = await runtime().editHtml(
      { newString: '<p>13</p>', oldString: '<p>12</p>' },
      ctx,
    );

    expect(result.success).toBe(true);
    expect(mocks.runWithDocumentLock).toHaveBeenCalledWith('doc-1', expect.any(Function));
    expect(mocks.updateDocument).toHaveBeenCalledWith('doc-1', {
      content: HTML.replace('<p>12</p>', '<p>13</p>'),
      expectedUpdatedAt: new Date('2026-10-19T00:00:00Z'),
      lockOwnerId: 'lock-owner',
      saveSource: 'llm_call',
    });
  });

  it('re-applies an edit on the latest HTML when another write landed first', async () => {
    // Another call of the same step saved its edit between this read and write.
    const concurrent = HTML.replace('<h1>Report</h1>', '<h1>Report v2</h1>');
    mocks.findById
      .mockResolvedValueOnce(page('custom/html', HTML))
      .mockResolvedValueOnce(page('custom/html', concurrent, new Date('2026-10-19T00:00:01Z')));
    mocks.updateDocument
      .mockRejectedValueOnce(
        Object.assign(new Error('Document has been updated by another session'), {
          cause: { data: { code: 'DocumentVersionMismatch' } },
          code: 'CONFLICT',
        }),
      )
      .mockResolvedValueOnce({});

    const result = await runtime().editHtml(
      { newString: '<p>13</p>', oldString: '<p>12</p>' },
      ctx,
    );

    expect(result.success).toBe(true);
    expect(mocks.updateDocument).toHaveBeenLastCalledWith(
      'doc-1',
      expect.objectContaining({
        content: concurrent.replace('<p>12</p>', '<p>13</p>'),
        expectedUpdatedAt: new Date('2026-10-19T00:00:01Z'),
      }),
    );
  });

  it('rewrites the whole page', async () => {
    const next = '<!doctype html><html><body>v2</body></html>';
    await runtime().writeHtml({ html: next }, ctx);

    expect(mocks.updateDocument).toHaveBeenCalledWith(
      'doc-1',
      expect.objectContaining({ content: next }),
    );
  });

  it('writes nothing when the edit does not match', async () => {
    const result = await runtime().editHtml({ newString: 'x', oldString: '<h2>' }, ctx);

    expect(result.success).toBe(false);
    expect(result.content).toMatch(/not found/);
    expect(mocks.updateDocument).not.toHaveBeenCalled();
  });

  it('refuses node APIs, which would replace the page with Markdown', async () => {
    const result = await runtime().modifyNodes(
      { operations: [{ action: 'remove', id: 'n1' }] },
      ctx,
    );

    expect(result.success).toBe(false);
    expect(result.content).toMatch(/HTML page/);
    expect(mocks.updateDocument).not.toHaveBeenCalled();
  });
});

describe('page agent on a rich-text page', () => {
  it('refuses the HTML APIs', async () => {
    mocks.findById.mockResolvedValue(page('custom/document', '# Notes'));

    const result = await runtime().writeHtml({ html: '<p>x</p>' }, ctx);

    expect(result.success).toBe(false);
    expect(result.content).toMatch(/rich-text page/);
    expect(mocks.updateDocument).not.toHaveBeenCalled();
  });
});
