'use client';

import {
  INSERT_HEADING_COMMAND,
  INSERT_TABLE_COMMAND,
  ReactCodePlugin,
  ReactCodeblockPlugin,
  ReactHRPlugin,
  ReactImagePlugin,
  ReactLinkHighlightPlugin,
  ReactListPlugin,
  ReactMathPlugin,
  ReactTablePlugin,
} from '@lobehub/editor';
import { Editor, useEditor } from '@lobehub/editor/react';
import { Heading1Icon, Heading2Icon, Heading3Icon, Table2Icon } from 'lucide-react';
import { CSSProperties, memo } from 'react';
import { useTranslation } from 'react-i18next';

type EditorInstance = ReturnType<typeof useEditor>;

interface EditorContentProps {
  editor: EditorInstance;
  onInit: (editor: EditorInstance) => void;
  onTextChange?: () => void;
  placeholder?: string;
  style?: CSSProperties;
}

const EditorContent = memo<EditorContentProps>(
  ({ editor, onTextChange, placeholder, style, onInit }) => {
    const { t } = useTranslation('file');

    return (
      <Editor
        content={''}
        editor={editor}
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
          ReactImagePlugin,
        ]}
        slashOption={{
          items: [
            {
              icon: Heading1Icon,
              key: 'h1',
              label: 'Heading 1',
              onSelect: (editor) => {
                editor.dispatchCommand(INSERT_HEADING_COMMAND, { tag: 'h1' });
              },
            },
            {
              icon: Heading2Icon,
              key: 'h2',
              label: 'Heading 2',
              onSelect: (editor) => {
                editor.dispatchCommand(INSERT_HEADING_COMMAND, { tag: 'h2' });
              },
            },
            {
              icon: Heading3Icon,
              key: 'h3',
              label: 'Heading 3',
              onSelect: (editor) => {
                editor.dispatchCommand(INSERT_HEADING_COMMAND, { tag: 'h3' });
              },
            },
            {
              icon: Table2Icon,
              key: 'table',
              label: 'Table',
              onSelect: (editor) => {
                editor.dispatchCommand(INSERT_TABLE_COMMAND, { columns: '3', rows: '3' });
              },
            },
          ],
        }}
        style={{
          minHeight: '400px',
          ...style,
        }}
        type={'text'}
      />
    );
  },
);

export default EditorContent;
