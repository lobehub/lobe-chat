import { ActionIcon, ChatInputArea, ChatSendButton } from '@lobehub/ui';
import { Maximize2, Minimize2 } from 'lucide-react';
import { memo, useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import {
  CHAT_TEXTAREA_HEIGHT,
  CHAT_TEXTAREA_MAX_HEIGHT,
  HEADER_HEIGHT,
} from '@/const/layoutTokens';
import ActionBar from '@/features/ChatInput/ActionBar';
import SaveTopic from '@/features/ChatInput/Topic';
import { useChatInput } from '@/features/ChatInput/useChatInput';

import DragUpload from './DragUpload';
import { LocalFiles } from './LocalFiles';
import { useAutoFocus } from './useAutoFocus';

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

  useAutoFocus(ref);

  const handleSizeChange = useCallback(
    (_: any, size: any) => {
      if (!size) return;
      updatePreference({
        inputHeight: typeof size.height === 'string' ? Number.parseInt(size.height) : size.height,
      });
    },
    [updatePreference],
  );

  const buttonAddons = useMemo(
    () => (
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
    ),
    [canUpload, loading, onSend, onStop, t],
  );

  const topAddons = useMemo(
    () => (
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
    ),
    [expand],
  );

  const hasValue = !!value;

  useEffect(() => {
    const fn = (e: BeforeUnloadEvent) => {
      if (hasValue) {
        // set returnValue to trigger alert modal
        // Note: No matter what value is set, the browser will display the standard text
        e.returnValue = '你有正在输入中的内容，确定要离开吗？';
      }
    };

    window.addEventListener('beforeunload', fn);
    return () => {
      window.removeEventListener('beforeunload', fn);
    };
  }, [hasValue]);

  return (
    <>
      {canUpload && <DragUpload />}
      <ChatInputArea
        autoFocus
        bottomAddons={buttonAddons}
        expand={expand}
        heights={{
          headerHeight: HEADER_HEIGHT,
          inputHeight,
          maxHeight: CHAT_TEXTAREA_MAX_HEIGHT,
          minHeight: CHAT_TEXTAREA_HEIGHT,
        }}
        loading={loading}
        onInput={onInput}
        onSend={onSend}
        onSizeChange={handleSizeChange}
        placeholder={t('sendPlaceholder')}
        ref={ref}
        topAddons={topAddons}
        value={value}
      />
    </>
  );
});

export default ChatInputDesktopLayout;
