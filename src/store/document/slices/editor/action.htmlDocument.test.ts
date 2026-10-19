import type { IEditor } from '@lobehub/editor';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { documentService } from '@/services/document';

import { useDocumentStore } from '../../store';

vi.mock('@/services/document', () => ({
  documentService: {
    updateDocument: vi.fn(),
  },
}));
vi.mock('@/services/notebook', () => ({ notebookService: {} }));

const HTML = '<!doctype html><html><body><h1>Report</h1></body></html>';

/** The page editor instance exists for an HTML page, but no Lexical editor is mounted on it. */
const makeUnmountedEditor = () => {
  const editor = {
    getDocument: vi.fn((format: string) =>
      format === 'json' ? { root: { children: [], type: 'root' } } : '',
    ),
    setDocument: vi.fn(),
  };
  return { editor: editor as unknown as IEditor, spy: editor };
};

const seedHtmlPage = (editor: IEditor) => {
  useDocumentStore.getState().initDocumentWithEditor({
    autoSave: true,
    content: HTML,
    contentFormat: 'html',
    documentId: 'page-1',
    editor,
    editorData: null,
    sourceType: 'page',
    updatedAt: new Date('2026-10-19T00:00:00Z'),
  });
};

beforeEach(() => {
  useDocumentStore.setState({
    activeDocumentId: undefined,
    documents: {},
    documentDetailMap: {},
    editor: undefined,
  });
  vi.mocked(documentService.updateDocument).mockReset().mockResolvedValue({
    historyAppended: false,
    id: 'page-1',
    updatedAt: '2026-10-19T00:00:01Z',
  });
});

describe('HTML page persistence', () => {
  it('never loads the HTML into the rich-text editor', async () => {
    const { editor, spy } = makeUnmountedEditor();
    seedHtmlPage(editor);

    await useDocumentStore.getState().onEditorInit(editor, 'page-1');

    expect(spy.setDocument).not.toHaveBeenCalled();
  });

  it('never overwrites the HTML with the empty editor body on a manual or agent save', async () => {
    const { editor } = makeUnmountedEditor();
    seedHtmlPage(editor);

    useDocumentStore.getState().handleContentChange();
    await useDocumentStore.getState().performSave('page-1', undefined, { saveSource: 'manual' });
    await useDocumentStore.getState().commitEditorMutation('page-1', { saveSource: 'llm_call' });

    expect(documentService.updateDocument).not.toHaveBeenCalled();
    expect(useDocumentStore.getState().documents['page-1']).toMatchObject({
      content: HTML,
      isDirty: false,
    });
  });

  it('still renames the page without sending a body', async () => {
    const { editor } = makeUnmountedEditor();
    seedHtmlPage(editor);

    await useDocumentStore
      .getState()
      .performSave('page-1', { title: 'Goal report' }, { saveSource: 'autosave' });

    const request = vi.mocked(documentService.updateDocument).mock.calls[0][0];
    expect(request).toMatchObject({ id: 'page-1', title: 'Goal report' });
    expect(request).not.toHaveProperty('content');
    expect(request).not.toHaveProperty('editorData');
  });
});
