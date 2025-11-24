'use client';

import {
  INSERT_HEADING_COMMAND,
  INSERT_MENTION_COMMAND,
  INSERT_TABLE_COMMAND,
  ReactCodeblockPlugin,
  ReactCodePlugin,
  ReactHRPlugin,
  ReactLinkHighlightPlugin,
  ReactListPlugin,
  ReactMathPlugin,
  ReactMentionPlugin,
  ReactTablePlugin,
  IEditor,
} from '@lobehub/editor';
import { Editor, useEditor } from '@lobehub/editor/react';
import { Icon } from '@lobehub/ui';
import { useTheme } from 'antd-style';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import isEqual from 'fast-deep-equal';
import { debounce } from 'lodash-es';
import { Heading1Icon, Heading2Icon, Heading3Icon, Loader2Icon, Table2Icon } from 'lucide-react';
import { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useStore } from '@/features/AgentSetting/store';
import { pluginHelpers, useToolStore } from '@/store/tool';
import { toolSelectors } from '@/store/tool/selectors';

import PROMPT_TEMPLATE from './promptTemplate.json';

dayjs.extend(relativeTime);

const SAVE_DEBOUNCE_TIME = 200; // ms


/**
 * EditorCanvas
 *
 * Rich text editor for Agent system prompt using @lobehub/editor.
 * Features:
 * - Auto-save with debouncing and status indicator
 * - Structured template for new agents
 * - @ mention for inserting available tools
 * - Slash commands for formatting
 * - Full markdown support
 */
const EditorCanvas = memo(() => {
  const { t } = useTranslation('setting');
  const theme = useTheme();
  const editor = useEditor();
  const editorContent = useStore((s) => s.config.editorContent);
  const updateConfig = useStore((s) => s.setAgentConfig);

  const [initialLoad] = useState(editorContent || PROMPT_TEMPLATE);

  // Get available tools for @ mention
  const installedTools = useToolStore(toolSelectors.metaList, isEqual);

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [lastUpdatedTime, setLastUpdatedTime] = useState<Date | null>(null);

  const handleChange = debounce((editor: IEditor) => {
    setSaveStatus('saving');

    try {
      const markdownContent = editor.getDocument('markdown') as unknown as string;
      const jsonContent = editor.getDocument('json') as unknown as Record<string, any>;

      // Save both markdown (for AI) and JSON (for editor state)
      updateConfig({
        editorContent: structuredClone(jsonContent || {}), // Store as object, not string
        systemRole: markdownContent || '',
      });

      setSaveStatus('saved');
      setLastUpdatedTime(new Date());
    } catch (error) {
      console.error('[EditorCanvas] Failed to save:', error);
      setSaveStatus('idle');
    }
  }, SAVE_DEBOUNCE_TIME);

  const handleInit = (editor: IEditor) => {
    handleChange(editor);
  };


  // Mention options for @ tools insertion
  const mentionOptions = useMemo(
    () => ({
      items: async (
        search: { leadOffset: number; matchingString: string; replaceableString: string } | null,
      ) => {
        const searchQuery = search?.matchingString?.toLowerCase() || '';

        const filteredTools = installedTools.filter((tool) => {
          const title = pluginHelpers.getPluginTitle(tool.meta);
          const desc = pluginHelpers.getPluginDesc(tool.meta);

          return (
            title?.toLowerCase().includes(searchQuery) ||
            desc?.toLowerCase().includes(searchQuery) ||
            tool.identifier?.toLowerCase().includes(searchQuery)
          );
        });

        return filteredTools.map((tool) => {
          const title = pluginHelpers.getPluginTitle(tool.meta) || tool.identifier;
          const desc = pluginHelpers.getPluginDesc(tool.meta);

          return {
            key: tool.identifier,
            label: title,
            metadata: {
              description: desc,
              identifier: tool.identifier,
            },
            onSelect: (editor: any) => {
              // Insert tool as mention
              editor.dispatchCommand(INSERT_MENTION_COMMAND, {
                label: title,
                metadata: { description: desc, identifier: tool.identifier },
              });
            },
          };
        });
      },
    }),
    [installedTools],
  );

  return (
    <Flexbox
      flex={1}
      style={{
        overflowY: 'auto',
        position: 'relative',
      }}
    >
      {/* Save Status Indicator (Top Right) */}
      <Flexbox
        align="center"
        direction="horizontal"
        gap={8}
        style={{
          paddingBlock: 12,
          paddingInline: 32,
          position: 'sticky',
          right: 32,
          top: 0,
          zIndex: 10,
        }}
      >
        <Flexbox flex={1} />
        {saveStatus === 'saving' && (
          <Flexbox align="center" direction="horizontal" gap={6}>
            <Icon icon={Loader2Icon} spin />
            <span style={{ color: theme.colorTextTertiary, fontSize: 12 }}>Saving...</span>
          </Flexbox>
        )}
        {saveStatus === 'saved' && lastUpdatedTime && (
          <span
            style={{
              color: theme.colorTextTertiary,
              fontSize: 12,
              whiteSpace: 'nowrap',
            }}
          >
            Saved {dayjs(lastUpdatedTime).fromNow()}
          </span>
        )}
      </Flexbox>

      <Flexbox
        paddingBlock={12}
        style={{
          margin: '0 auto',
          maxWidth: 900,
          paddingInline: 32,
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
            onInit={handleInit}
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
