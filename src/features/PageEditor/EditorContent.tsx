'use client';

import {
  INSERT_CHECK_LIST_COMMAND,
  INSERT_HEADING_COMMAND,
  INSERT_IMAGE_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_TABLE_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
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
import { Editor, useEditor, useEditorState } from '@lobehub/editor/react';
import {
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  ImageIcon,
  ListIcon,
  ListOrderedIcon,
  ListTodoIcon,
  SquareDashedBottomCodeIcon,
  Table2Icon,
} from 'lucide-react';
import { CSSProperties, memo, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { useFileStore } from '@/store/file';

import Toolbar from './Toolbar';

type EditorInstance = ReturnType<typeof useEditor>;

interface EditorContentProps {
  editor: EditorInstance;
  onBlur?: () => void;
  onInit: (editor: EditorInstance) => void;
  onTextChange?: () => void;
  placeholder?: string;
  style?: CSSProperties;
}

const EditorContent = memo<EditorContentProps>(
  ({ editor, onTextChange, placeholder, style, onInit, onBlur }) => {
    const { t } = useTranslation(['file', 'editor']);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const uploadWithProgress = useFileStore((s) => s.uploadWithProgress);
    const editorState = useEditorState(editor);

    const handleImageUpload = async (file: File) => {
      if (!editor) return;

      try {
        // Create a blob URL for immediate preview
        const blobUrl = URL.createObjectURL(file);

        // Insert the image immediately with blob URL for preview
        editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
          file,
        });

        // Upload the image to storage in background
        const result = await uploadWithProgress({
          file,
          skipCheckFileType: false,
          source: 'page-editor',
        });

        if (result) {
          // Replace the blob URL with permanent URL in the editor state
          const currentDoc = editor.getDocument('json');
          if (currentDoc) {
            // Recursively search and replace blob URL with permanent URL
            const replaceBlobUrl = (obj: any): any => {
              if (typeof obj === 'string' && obj.startsWith('blob:')) {
                // Replace any blob URL with our permanent URL
                return result.url;
              }
              if (obj && typeof obj === 'object') {
                const newObj: any = Array.isArray(obj) ? [] : {};
                const entries = Object.entries(obj);
                for (const [key, value] of entries) {
                  newObj[key] = replaceBlobUrl(value);
                }
                return newObj;
              }
              return obj;
            };

            const updatedDoc = replaceBlobUrl(currentDoc);
            editor.setDocument('json', JSON.stringify(updatedDoc));
          }

          // Clean up the blob URL
          URL.revokeObjectURL(blobUrl);
          console.log('Image uploaded and URL updated:', result.url);
        }
      } catch (error) {
        console.error('Failed to upload image:', error);
      }
    };

    const handleFileInputChange = (e: { target: { files?: FileList | null; value: string } }) => {
      const file = e.target.files?.[0];
      if (file && file.type.startsWith('image/')) {
        void handleImageUpload(file);
      }
      // Reset input so the same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };

    return (
      <>
        <input
          accept="image/*"
          onChange={handleFileInputChange}
          ref={fileInputRef}
          style={{ display: 'none' }}
          type="file"
        />
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
              children: <Toolbar editor={editor} floating />,
            }),
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
              {
                icon: SquareDashedBottomCodeIcon,
                key: 'codeblock',
                label: t('typobar.codeblock', { ns: 'editor' }),
                onSelect: () => {
                  editorState.codeblock();
                },
              },
              {
                icon: ImageIcon,
                key: 'image',
                label: t('documentEditor.slashCommands.image'),
                onSelect: () => {
                  fileInputRef.current?.click();
                },
              },
              {
                icon: ListTodoIcon,
                key: 'todo-list',
                label: t('documentEditor.slashCommands.todoList'),
                onSelect: (editor) => {
                  editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined);
                },
              },
              {
                icon: ListIcon,
                key: 'bulleted-list',
                label: t('documentEditor.slashCommands.bulletedList'),
                onSelect: (editor) => {
                  editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
                },
              },
              {
                icon: ListOrderedIcon,
                key: 'ordered-list',
                label: t('documentEditor.slashCommands.orderedList'),
                onSelect: (editor) => {
                  editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
                },
              },
            ],
          }}
          style={style}
          type={'text'}
        />
      </>
    );
  },
);

export default EditorContent;
