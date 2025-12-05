'use client';

import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { usePageEditorContext } from '../Context';
import EditorContent from '../EditorContent';
import Title from './Title';

const Body = memo(() => {
  const { t } = useTranslation('file');
  const { editor, onEditorInit, handleContentChange, performSave } = usePageEditorContext();

  return (
    <Flexbox flex={1} style={{ overflowY: 'auto' }}>
      <Title />
      <EditorContent
        editor={editor}
        onBlur={performSave}
        onInit={onEditorInit}
        onTextChange={handleContentChange}
        placeholder={t('documentEditor.editorPlaceholder')}
      />
    </Flexbox>
  );
});

export default Body;
