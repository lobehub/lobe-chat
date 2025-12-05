import { IEditor } from '@lobehub/editor';
import { useMemo } from 'react';

import { usePageEditorStore } from '../store';

export interface PageEditor {
  clearContent: () => void;
  focus: () => void;
  getJSONState: () => any;
  getMarkdownContent: () => string;
  instance: IEditor;
  setJSONState: (content: any) => void;
}

export const usePageEditor = () => {
  const editor = usePageEditorStore((s) => s.editor);

  return useMemo<PageEditor>(
    () => ({
      clearContent: () => {
        editor?.cleanDocument();
      },
      focus: () => {
        editor?.focus();
      },
      getJSONState: () => editor?.getDocument('json'),
      getMarkdownContent: () => (editor?.getDocument('markdown') as unknown as string) || '',
      instance: editor!,
      setJSONState: (content: any) => {
        editor?.setDocument('json', JSON.stringify(content));
      },
    }),
    [editor],
  );
};
