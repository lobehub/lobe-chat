import {
  INSERT_MENTION_COMMAND,
  ReactCodePlugin,
  ReactLinkHighlightPlugin,
  ReactListPlugin,
  ReactMentionPlugin,
} from '@lobehub/editor';
import {
  ChatInput,
  ChatInputActionBar,
  Editor,
  SendButton,
  useEditor,
} from '@lobehub/editor/react';
import { ActionIcon, Flexbox, Upload } from '@lobehub/ui';
import * as stylex from '@stylexjs/stylex';
import { $getSelection, $isRangeSelection } from 'lexical';
import { Paperclip } from 'lucide-react';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useLocalDragUpload } from '@/components/DragUploadZone/useLocalDragUpload';
import { usePasteFile } from '@/components/DragUploadZone/usePasteFile';
import DraftFile from '@/features/ChatInput/Mobile/FilePreview/FileItem/File';
import DraftImage from '@/features/ChatInput/Mobile/FilePreview/FileItem/Image';
import WideScreenContainer from '@/features/WideScreenContainer';
import { useEnterToSend } from '@/hooks/useEnterToSend';
import { usePermission } from '@/hooks/usePermission';
import { useSingleton } from '@/hooks/useSingleton';
import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';
import { featureFlagsSelectors, useServerConfigStore } from '@/store/serverConfig';

import { $insertChannelMentionBoundary, channelMentionIds } from './mentions';
import { styles } from './styles';
import { useAttachments } from './useAttachments';

const plugins = [ReactCodePlugin, ReactListPlugin, ReactLinkHighlightPlugin, ReactMentionPlugin];

export function Composer({
  members,
  onSend,
  replying,
  onStop,
  placeholder,
}: {
  members: { id: string; name: string }[];
  replying?: boolean;
  onStop?: () => void;
  placeholder?: string;
  onSend: (
    content: string,
    mentions: string[],
    requestKey: string,
    fileIds?: string[],
  ) => Promise<void>;
}) {
  const { t } = useTranslation('channel');
  const editor = useEditor();
  const shouldSendOnEnter = useEnterToSend();
  const height = useGlobalStore(systemStatusSelectors.chatInputHeight);
  const [content, setContent] = useState('');
  const [busy, setBusy] = useState(false);
  const sending = useRef(false);
  const previousDocument = useRef('');
  const [error, setError] = useState('');
  const requestKey = useSingleton(() => ({ current: crypto.randomUUID() }));
  const attachments = useAttachments(() => {
    requestKey.current = crypto.randomUUID();
  });
  const { allowed, reason } = usePermission('create_content');
  const enableUpload = useServerConfigStore((s) => featureFlagsSelectors(s).enableKnowledgeBase);
  const canUpload = allowed && enableUpload;
  const upload = (files: File[]) => {
    if (!sending.current && canUpload) return attachments.upload(files);
  };
  // Keep consuming file drops even when uploading is blocked; the callback gates uploads.
  const { getContainerProps } = useLocalDragUpload({ onUploadFiles: upload });
  usePasteFile(editor, upload);
  const hasDraft = !!content.trim() || attachments.items.length > 0;
  const send = async () => {
    const value = String(editor.getDocument('markdown') || '').trim();
    const fileIds = attachments.readyFileIds();
    if (sending.current || !fileIds || (!value && !fileIds.length)) return;
    sending.current = true;
    setBusy(true);
    setError('');
    try {
      await onSend(
        value,
        channelMentionIds(
          editor.getDocument('json'),
          members.map((member) => member.id),
        ),
        requestKey.current,
        fileIds,
      );
      editor.cleanDocument();
      attachments.clear();
      setContent('');
      requestKey.current = crypto.randomUUID();
    } catch (cause) {
      console.error('Failed to send Channel message', cause);
      setError(t('sendFailed'));
    } finally {
      sending.current = false;
      setBusy(false);
    }
  };
  return (
    <WideScreenContainer fullWidth paddingInline={24}>
      <Flexbox {...stylex.props(styles.composer)} gap={8} {...getContainerProps()}>
        {attachments.items.length > 0 && (
          <Flexbox horizontal gap={8} inert={busy} wrap="wrap">
            {attachments.items.map((item) =>
              item.file.type.startsWith('image/') && item.status === 'success' ? (
                <DraftImage
                  alt={item.file.name}
                  key={item.id}
                  src={item.fileUrl}
                  onRemove={() => attachments.remove(item.id)}
                />
              ) : (
                <DraftFile
                  {...item}
                  key={item.id}
                  onRemove={() => attachments.remove(item.id)}
                  onRetry={() => attachments.retry(item.id)}
                />
              ),
            )}
          </Flexbox>
        )}
        <ChatInput
          resize
          defaultHeight={height || 32}
          maxHeight={320}
          minHeight={36}
          footer={
            <ChatInputActionBar
              style={{ paddingRight: 8 }}
              left={
                <Flexbox horizontal align="center" gap={8}>
                  {enableUpload && (
                    <Upload
                      multiple
                      disabled={busy || !canUpload}
                      onFiles={(files) => void upload(files)}
                    >
                      <ActionIcon
                        aria-label={t('attachments.upload')}
                        disabled={busy || !canUpload}
                        icon={Paperclip}
                        title={reason || t('attachments.upload')}
                      />
                    </Upload>
                  )}
                </Flexbox>
              }
              right={
                <SendButton
                  aria-label={t(replying && !hasDraft ? 'stopReply' : 'send')}
                  disabled={busy || !hasDraft || attachments.blocked}
                  generating={replying && !hasDraft}
                  loading={busy}
                  onSend={() => void send()}
                  onStop={onStop}
                />
              }
            />
          }
          onSizeChange={(chatInputHeight) =>
            useGlobalStore.getState().updateSystemStatus({ chatInputHeight })
          }
        >
          <Editor
            autoFocus
            aria-label={placeholder || t('composer')}
            content=""
            editable={!busy}
            editor={editor}
            placeholder={placeholder || t('composer')}
            plugins={plugins}
            slashPlacement="top"
            type="text"
            variant="chat"
            mentionOption={{
              items: members.map((member) => ({
                key: member.id,
                label: member.name,
                metadata: { type: 'channel-member', id: member.id },
              })),
              searchKeys: ['label'],
              markdownWriter: (node) => `@${node.label}`,
              onSelect: (instance, option) => {
                instance.dispatchCommand(INSERT_MENTION_COMMAND, {
                  label: String(option.label),
                  metadata: option.metadata,
                });
                // Leave the decorator's cursor node before the next @ is typed.
                instance.getLexicalEditor()?.update(() => {
                  const selection = $getSelection();
                  if ($isRangeSelection(selection)) selection.insertText(' ');
                });
              },
            }}
            onKeyDown={({ event }) => members.length > 0 && $insertChannelMentionBoundary(event)}
            onChange={() => {
              // onTextChange skips the first dirty update in the editor. A first
              // paste/keystroke must enable Send, while caret moves keep retries idempotent.
              const document = JSON.stringify(editor.getDocument('json'));
              if (document !== previousDocument.current) {
                previousDocument.current = document;
                setContent(String(editor.getDocument('markdown') || ''));
                requestKey.current = crypto.randomUUID();
              }
            }}
            onPressEnter={({ event }) => {
              if (event.isComposing || !shouldSendOnEnter(event)) return;
              void send();
              return true;
            }}
          />
        </ChatInput>
        {error && (
          <span {...stylex.props(styles.error)} role="alert">
            {error}
          </span>
        )}
      </Flexbox>
    </WideScreenContainer>
  );
}
