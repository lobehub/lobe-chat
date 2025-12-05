'use client';

import {
  IEditor,
  ReactCodePlugin,
  ReactCodeblockPlugin,
  ReactHRPlugin,
  ReactLinkHighlightPlugin,
  ReactListPlugin,
  ReactMathPlugin,
  ReactMentionPlugin,
  ReactTablePlugin,
  ReactToolbarPlugin,
} from '@lobehub/editor';
import { Editor } from '@lobehub/editor/react';
import { debounce, isEqual } from 'lodash-es';
import { memo, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useStore } from '@/features/AgentSetting/store';

import { useMentionOptions } from '../ProfileEditor/MentionList';
import PROMPT_TEMPLATE from '../ProfileEditor/promptTemplate.json';
import { useProfileStore } from '../store';
import TypoBar from './TypoBar';
import { useSlashItems } from './useSlashItems';

const SAVE_DEBOUNCE_TIME = 300; // ms
type SavePayload = { editorData: Record<string, any>; systemRole: string };

const EditorCanvas = memo(() => {
  const { t } = useTranslation('setting');
  const [editorInit, setEeitorInit] = useState(false);
  const [contentInit, setContentInit] = useState(false);
  const editorData = useStore((s) => s.config.editorData, isEqual);
  const systemRole = useStore((s) => s.config.systemRole);
  const updateConfig = useStore((s) => s.setAgentConfig);
  const [initialLoad] = useState(editorData || PROMPT_TEMPLATE);
  const mentionOptions = useMentionOptions();
  const editor = useProfileStore((s) => s.editor);
  const slashItems = useSlashItems();

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
    if (!editorInit || !editor || contentInit) return;
    try {
      if (editorData) {
        editor.setDocument('json', editorData || PROMPT_TEMPLATE);
      } else if (systemRole) {
        editor.setDocument('markdown', systemRole);
      } else {
        editor.setDocument('json', PROMPT_TEMPLATE);
      }
      setContentInit(true);
    } catch (error) {
      console.error('[EditorCanvas] Failed to init editor content:', error);
    }
  }, [editorInit, contentInit, editor, editorData, systemRole]);

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
    <div
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
      }}
    >
      <Editor
        content={initialLoad}
        editor={editor!}
        lineEmptyPlaceholder={t('settingAgent.prompt.placeholder')}
        mentionOption={mentionOptions}
        onInit={() => setEeitorInit(true)}
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
          Editor.withProps(ReactToolbarPlugin, {
            children: <TypoBar />,
          }),
        ]}
        slashOption={{
          items: slashItems,
        }}
        style={{
          paddingBottom: 64,
        }}
      />
    </div>
  );
});

export default EditorCanvas;
