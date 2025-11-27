'use client';

import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { usePageEditorContext } from '../Context';
import EditorContent from '../EditorContent';
import Title from './Title';

const Body = memo(() => {
  const { t } = useTranslation('file');
  const { editor, onEditorInit, handleContentChange } = usePageEditorContext();

  return (
    <Flexbox flex={1} style={{ overflowY: 'auto' }}>
      <Flexbox
        paddingBlock={36}
        style={{
          margin: '0 auto',
          maxWidth: 900,
          paddingLeft: 32,
          paddingRight: 48,
          width: '100%',
        }}
      >
        <Title />

        <div
          onClick={() => editor?.focus()}
          style={{
            cursor: 'text',
            flex: 1,
            minHeight: '400px',
          }}
        >
          <EditorContent
            editor={editor}
            onInit={onEditorInit}
            onTextChange={handleContentChange}
            placeholder={t('documentEditor.editorPlaceholder')}
            style={{
              minHeight: '400px',
              paddingBottom: '200px',
            }}
          />
        </div>
      </Flexbox>
    </Flexbox>
  );
});

export default Body;
