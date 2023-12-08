import { ActionIcon, ChatInputArea, ChatSendButton } from '@lobehub/ui';
import { Maximize2, Minimize2 } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import ActionBar from '@/app/chat/features/ChatInput/ActionBar';
import SaveTopic from '@/app/chat/features/ChatInput/Topic';
import { useChatInput } from '@/app/chat/features/ChatInput/useChatInput';
import { CHAT_TEXTAREA_HEIGHT, HEADER_HEIGHT } from '@/const/layoutTokens';

import DragUpload from './DragUpload';
import { LocalFiles } from './LocalFiles';

const ChatInputDesktopLayout = memo(() => {
  const { t } = useTranslation('chat');
  const {
    ref,
    onStop,
    onSend,
    loading,
    value,
    onInput,
    expand,
    setExpand,
    inputHeight,
    updatePreference,
    canUpload,
  } = useChatInput();

  return (
    <>
      {canUpload && <DragUpload />}
      <ChatInputArea
        bottomAddons={
          <ChatSendButton
            leftAddons={canUpload && <LocalFiles />}
            loading={loading}
            onSend={onSend}
            onStop={onStop}
            rightAddons={<SaveTopic />}
            texts={{
              send: t('send'),
              stop: t('stop'),
              warp: t('warp'),
            }}
          />
        }
        expand={expand}
        heights={{ headerHeight: HEADER_HEIGHT, inputHeight, minHeight: CHAT_TEXTAREA_HEIGHT }}
        loading={loading}
        onInput={onInput}
        onSend={onSend}
        onSizeChange={(_, size) => {
          if (!size) return;
          updatePreference({
            inputHeight:
              typeof size.height === 'string' ? Number.parseInt(size.height) : size.height,
          });
        }}
        placeholder={t('sendPlaceholder')}
        ref={ref}
        topAddons={
          <ActionBar
            rightAreaEndRender={
              <ActionIcon
                icon={expand ? Minimize2 : Maximize2}
                onClick={() => {
                  setExpand(!expand);
                }}
              />
            }
          />
        }
        value={value}
      />
    </>
  );
});

export default ChatInputDesktopLayout;
