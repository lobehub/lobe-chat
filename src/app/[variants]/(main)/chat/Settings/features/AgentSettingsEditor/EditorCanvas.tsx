'use client';

import {
  IEditor,
  INSERT_HEADING_COMMAND,
  INSERT_TABLE_COMMAND,
  ReactCodePlugin,
  ReactCodeblockPlugin,
  ReactHRPlugin,
  ReactLinkHighlightPlugin,
  ReactListPlugin,
  ReactMathPlugin,
  ReactMentionPlugin,
  ReactTablePlugin,
} from '@lobehub/editor';
import { Editor, useEditor } from '@lobehub/editor/react';
import { debounce } from 'lodash-es';
import { Heading1Icon, Heading2Icon, Heading3Icon, Table2Icon } from 'lucide-react';
import { memo, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useStore } from '@/features/AgentSetting/store';

import { useMentionOptions } from './MentionList';
import PROMPT_TEMPLATE from './promptTemplate.json';

const SAVE_DEBOUNCE_TIME = 300; // ms
type SavePayload = { editorData: Record<string, any>; systemRole: string };

/**
 * EditorCanvas
 *
 * Rich text editor for Agent system prompt using @lobehub/editor.
 * Features:
 * - Auto-save with debouncing (status indicator now in AutoSaveHint)
 * - Structured template for new agents
 * - @ mention for inserting available tools
 * - Slash commands for formatting
 * - Full markdown support
 */
const EditorCanvas = memo(() => {
  const { t } = useTranslation('setting');
  const editor = useEditor();
  const editorData = useStore((s) => s.config.editorData);
  const systemRole = useStore((s) => s.config.systemRole);
  const updateConfig = useStore((s) => s.setAgentConfig);
  const loadingState = useStore((s) => s.loadingState);
  const [initialLoad] = useState(editorData || PROMPT_TEMPLATE);

  useEffect(() => {
    if (
      editorData === undefined &&
      systemRole === undefined &&
      loadingState?.avatar === undefined
    ) {
      return;
    }
    if (editorData) {
      editor?.setDocument('json', editorData || PROMPT_TEMPLATE);
    } else if (systemRole) {
      editor?.setDocument('markdown', systemRole);
    } else {
      editor?.setDocument('json', PROMPT_TEMPLATE);
    }
  }, [loadingState]);

  // Mention options for @ tools insertion
  const mentionOptions = useMentionOptions();

  const debouncedSave = useMemo(
    () =>
      debounce(
        async (payload: SavePayload) => {
          try {
            await updateConfig(payload);
          } catch (error: any) {
            console.error('[EditorCanvas] Failed to save:', error);
          }
        },
        SAVE_DEBOUNCE_TIME,
        { leading: false, trailing: true },
      ),
    [updateConfig],
  );

  useEffect(() => {
    return () => debouncedSave.cancel();
  }, [debouncedSave]);

  const handleChange = (editor: IEditor) => {
    try {
      const markdownContent = editor.getDocument('markdown') as unknown as string;
      const jsonContent = editor.getDocument('json') as unknown as Record<string, any>;

      debouncedSave({
        editorData: structuredClone(jsonContent || {}), // Store as object, not string
        systemRole: markdownContent || '',
      });
    } catch (error) {
      console.error('[EditorCanvas] Failed to read editor content:', error);
    }
  };

  return (
    <Flexbox
      flex={1}
      style={{
        overflowY: 'auto',
        position: 'relative',
      }}
    >
      <Flexbox
        paddingBlock={12}
        style={{
          margin: '0 auto',
          paddingInline: 24,
          width: '100%',
        }}
      >
        <div
          onClick={() => editor?.focus()}
          style={{
            cursor: 'text',
            flex: 1,
            minHeight: '500px',
          }}
        >
          <Editor
            content={initialLoad}
            editor={editor}
            mentionOption={mentionOptions}
            onTextChange={handleChange}
            placeholder={t('settingAgent.prompt.placeholder')}
            plugins={[
              ReactListPlugin,
              ReactCodePlugin,
              ReactCodeblockPlugin,
              ReactHRPlugin,
              ReactLinkHighlightPlugin,
              ReactTablePlugin,
              ReactMathPlugin,
              ReactMentionPlugin,
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
              minHeight: '500px',
              paddingBottom: '200px',
            }}
          />
        </div>
      </Flexbox>
    </Flexbox>
  );
});

export default EditorCanvas;
