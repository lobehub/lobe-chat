'use client';

import {
  ReactCodePlugin,
  ReactCodeblockPlugin,
  ReactHRPlugin,
  ReactImagePlugin,
  ReactLinkHighlightPlugin,
  ReactListPlugin,
  ReactMathPlugin,
  ReactTablePlugin,
  ReactToolbarPlugin,
} from '@lobehub/editor';
import { Editor, useEditor } from '@lobehub/editor/react';
import { CSSProperties, memo } from 'react';
import { useTranslation } from 'react-i18next';

import TypoBar from './TypoBar';
import { useSlashItems } from './useSlashItems';

type EditorInstance = ReturnType<typeof useEditor>;

interface EditorContentProps {
  editor: EditorInstance;
  onBlur?: () => void;
  onInit: (editor: EditorInstance) => void;
  onTextChange?: () => void;
  placeholder?: string;
  style?: CSSProperties;
}

const EditorCanvas = memo<EditorContentProps>(
  ({ editor, onTextChange, placeholder, style, onInit, onBlur }) => {
    const { t } = useTranslation(['file', 'editor']);
    const slashItems = useSlashItems(editor);

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
          lineEmptyPlaceholder={placeholder || t('documentEditor.editorPlaceholder')}
          onBlur={onBlur}
          onInit={onInit}
          onTextChange={onTextChange}
          placeholder={placeholder || t('documentEditor.editorPlaceholder')}
          plugins={[
            ReactListPlugin,
            ReactCodePlugin,
            ReactCodeblockPlugin,
            ReactHRPlugin,
            ReactLinkHighlightPlugin,
            ReactTablePlugin,
            ReactMathPlugin,
            Editor.withProps(ReactImagePlugin, {
              defaultBlockImage: true,
            }),
            Editor.withProps(ReactToolbarPlugin, {
              children: <TypoBar editor={editor} floating />,
            }),
          ]}
          slashOption={{
            items: slashItems,
          }}
          style={{
            paddingBottom: 64,
            ...style,
          }}
          type={'text'}
        />
      </div>
    );
  },
);

export default EditorCanvas;
