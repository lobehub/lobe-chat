'use client';

import {
  ReactCodePlugin,
  ReactCodeblockPlugin,
  ReactHRPlugin,
  ReactLinkPlugin,
  ReactListPlugin,
  ReactMathPlugin,
  ReactTablePlugin,
} from '@lobehub/editor';
import { Editor } from '@lobehub/editor/react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { useDocumentEditorStore } from './store';

const EditorCanvas = memo(() => {
  const { t } = useTranslation('file');

  const editor = useDocumentEditorStore((s) => s.editor);
  const handleContentChange = useDocumentEditorStore((s) => s.handleContentChange);

  if (!editor) return null;

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
      }}
    >
      <Editor
        content={''}
        editor={editor}
        lineEmptyPlaceholder={t('pageEditor.editorPlaceholder')}
        onTextChange={handleContentChange}
        placeholder={t('pageEditor.editorPlaceholder')}
        plugins={[
          ReactListPlugin,
          ReactCodePlugin,
          ReactCodeblockPlugin,
          ReactHRPlugin,
          ReactLinkPlugin,
          ReactTablePlugin,
          ReactMathPlugin,
        ]}
        style={{
          paddingBottom: 64,
        }}
        type={'text'}
      />
    </div>
  );
});

export default EditorCanvas;
