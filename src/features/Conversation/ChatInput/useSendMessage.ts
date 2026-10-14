import { toast } from '@lobehub/ui/base-ui';
import isEqual from 'fast-deep-equal';
import { useRef, useState } from 'react';

import type { SendButtonHandler } from '@/features/ChatInput/store/initialState';
import { buildMessageContextSelections } from '@/features/ChatInput/utils/contextSelections';
import { checkProjectExecution } from '@/features/Projects/WorkingDirectories/checkExecution';
import { useChatStore } from '@/store/chat';
import { operationSelectors, topicSelectors } from '@/store/chat/selectors';
import { messageMapKey } from '@/store/chat/utils/messageMapKey';
import { fileChatSelectors, useFileStore } from '@/store/file';

import { useConversationStoreApi } from '../store';

export const useSendMessage = ({
  disableQueue,
  disableSend,
}: {
  disableQueue?: boolean;
  disableSend?: boolean;
}) => {
  const storeApi = useConversationStoreApi();
  const pending = useRef(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSend: SendButtonHandler = async ({
    clearContent,
    editor,
    getMarkdownContent,
    getEditorData,
  }) => {
    if (disableSend || pending.current) return;

    const { context, scheduledSendAt, sendMessage, commitScheduledSend } = storeApi.getState();
    const contextKey = messageMapKey(context);
    const fileStore = useFileStore.getState();
    const files = fileChatSelectors.chatUploadFileList(fileStore);
    const selections = fileChatSelectors.chatContextSelections(contextKey)(fileStore);
    if (fileChatSelectors.isUploadingFiles(fileStore)) return;
    if (
      disableQueue &&
      operationSelectors.isInputLoadingByContext(context)(useChatStore.getState())
    )
      return;

    const message = getMarkdownContent();
    if (!message.trim() && files.length === 0 && selections.length === 0) return;
    // Lexical serializes a fresh JSON document here. Capture it with the text,
    // target and attachments, before any request can yield to another draft.
    const editorData = getEditorData();
    pending.current = true;
    setIsSubmitting(true);
    let released = false;
    const release = () => {
      if (released) return;
      released = true;
      pending.current = false;
      setIsSubmitting(false);
    };

    const clearComposer = () => {
      const live = storeApi.getState();
      const unchanged =
        messageMapKey(live.context) === contextKey &&
        live.editor === editor &&
        getMarkdownContent() === message &&
        isEqual(getEditorData(), editorData);
      if (unchanged) clearContent();

      const store = useFileStore.getState();
      store.clearChatUploadFileList(files.map((file) => file.id));
      const liveSelections = fileChatSelectors.chatContextSelections(contextKey)(store);
      for (const selection of selections) {
        if (liveSelections.includes(selection)) {
          store.removeChatContextSelection({ contextKey, id: selection.id });
        }
      }
      return unchanged;
    };

    try {
      const chatState = useChatStore.getState();
      const topic = context.topicId
        ? topicSelectors.getTopicById(context.topicId)(chatState)
        : undefined;
      try {
        await checkProjectExecution(topic, chatState.isGatewayModeEnabled(context.agentId));
      } catch (error) {
        console.error('Project execution preflight failed', error);
        toast.error(error instanceof Error ? error.message : String(error));
        return;
      }

      if (scheduledSendAt) {
        const scheduled = await commitScheduledSend(message, files, { context, scheduledSendAt });
        if (scheduled) clearComposer();
        return;
      }

      const cleared = clearComposer();
      const { contextSelections, pageSelections } = buildMessageContextSelections(selections);
      const sending = sendMessage({
        contextSelections,
        conversationContext: context,
        editorData,
        files,
        message,
        onPreflightFailure: () => {
          const store = useFileStore.getState();
          store.restoreChatUploadFileList(files);
          store.restoreChatContextSelections(contextKey, selections);
        },
        pageSelections,
        preserveComposer: !cleared,
      });
      // The runtime owns the turn now. Follow-ups must remain available while
      // it streams; only the preflight/commit window is single-flight.
      release();
      await sending;
    } finally {
      release();
    }
  };

  return { handleSend, isSubmitting };
};
