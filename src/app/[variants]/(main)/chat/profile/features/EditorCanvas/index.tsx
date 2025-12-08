'use client';

import {
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
import { isEqual } from 'lodash-es';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useStore } from '@/features/AgentSetting/store';
import { useAgentStore } from '@/store/agent';

import { useMentionOptions } from '../ProfileEditor/MentionList';
import PROMPT_TEMPLATE from '../ProfileEditor/promptTemplate.json';
import { useProfileStore } from '../store';
import TypoBar from './TypoBar';
import { useSlashItems } from './useSlashItems';

const EditorCanvas = memo(() => {
  const { t } = useTranslation('setting');
  const [editorInit, setEditorInit] = useState(false);
  const [contentInit, setContentInit] = useState(false);
  const editorData = useStore((s) => s.config.editorData, isEqual);
  const systemRole = useStore((s) => s.config.systemRole);
  const updateConfig = useStore((s) => s.setAgentConfig);
  const [initialLoad] = useState(editorData || PROMPT_TEMPLATE);
  const mentionOptions = useMentionOptions();
  const editor = useProfileStore((s) => s.editor);
  const handleContentChange = useProfileStore((s) => s.handleContentChange);
  const slashItems = useSlashItems();

  // Streaming state from AgentStore
  const streamingSystemRole = useAgentStore((s) => s.streamingSystemRole);
  const streamingInProgress = useAgentStore((s) => s.streamingSystemRoleInProgress);
  const prevStreamingRef = useRef<string | undefined>(undefined);
  const wasStreamingRef = useRef(false);

  // Wrap handleContentChange with updateConfig
  const handleChange = useCallback(() => {
    // Don't trigger save during streaming
    if (streamingInProgress) return;
    handleContentChange(updateConfig);
  }, [handleContentChange, updateConfig, streamingInProgress]);

  // Handle streaming updates - update editor with streaming content
  useEffect(() => {
    if (!editor || !editorInit) return;
    if (!streamingInProgress) {
      prevStreamingRef.current = undefined;
      return;
    }

    // Only update if content has changed
    if (streamingSystemRole !== prevStreamingRef.current) {
      prevStreamingRef.current = streamingSystemRole;
      try {
        editor.setDocument('markdown', streamingSystemRole || '');
      } catch {
        // Ignore errors during streaming updates
      }
    }
  }, [editor, editorInit, streamingSystemRole, streamingInProgress]);

  // Trigger save when streaming ends
  useEffect(() => {
    if (wasStreamingRef.current && !streamingInProgress && editor && editorInit) {
      // Streaming just ended, wait for editor to update its internal state then save
      // This ensures editorData (json) is properly updated from the markdown content
      const timer = setTimeout(() => {
        handleContentChange(updateConfig);
      }, 100);
      return () => clearTimeout(timer);
    }
    wasStreamingRef.current = !!streamingInProgress;
  }, [streamingInProgress, editor, editorInit, handleContentChange, updateConfig]);

  useEffect(() => {
    if (!editorInit || !editor || contentInit) return;
    // Don't init if streaming is in progress
    if (streamingInProgress) return;
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
  }, [editorInit, contentInit, editor, editorData, systemRole, streamingInProgress]);

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
        onInit={() => setEditorInit(true)}
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
