'use client';

import {
  IEditor,
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

import TypoBar from '../EditorCanvas/TypoBar';
import { useSlashItems } from '../EditorCanvas/useSlashItems';

type EditorInstance = ReturnType<typeof useEditor>;

interface ModalEditorCanvasProps {
  editor: EditorInstance;
  onBlur?: () => void;
  onInit?: (editor: IEditor) => void;
  onTextChange?: () => void;
  placeholder?: string;
  style?: CSSProperties;
}

/**
 * EditorCanvas for Modal - uses its own editor instance instead of store
 */
const ModalEditorCanvas = memo<ModalEditorCanvasProps>(
  ({ editor, onBlur, onInit, onTextChange, placeholder, style }) => {
    const { t } = useTranslation(['file', 'editor']);
    const slashItems = useSlashItems(editor);

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
              children: <TypoBar floating />,
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

export default ModalEditorCanvas;
