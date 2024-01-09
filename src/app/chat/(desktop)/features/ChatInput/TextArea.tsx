import { TextArea } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { TextAreaRef } from 'antd/es/input/TextArea';
import { memo, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { useSendMessage } from '@/features/ChatInput/useSend';
import { useChatStore } from '@/store/chat';
import { useGlobalStore } from '@/store/global';
import { preferenceSelectors } from '@/store/global/selectors';
import { isCommandPressed } from '@/utils/keyboard';

import { useAutoFocus } from './useAutoFocus';

const useStyles = createStyles(({ css }) => {
  return {
    textarea: css`
      resize: none !important;

      height: 100% !important;
      padding: 0 24px;

      line-height: 1.5;

      box-shadow: none !important;
    `,
    textareaContainer: css`
      position: relative;
      flex: 1;
    `,
  };
});

const InputArea = memo<{ setExpand?: (expand: boolean) => void }>(({ setExpand }) => {
  const { t } = useTranslation('chat');
  const { styles } = useStyles();
  const ref = useRef<TextAreaRef>(null);
  const isChineseInput = useRef(false);

  const [loading, value, updateInputMessage] = useChatStore((s) => [
    !!s.chatLoadingId,
    s.inputMessage,
    s.updateInputMessage,
  ]);

  const useCmdEnterToSend = useGlobalStore(preferenceSelectors.useCmdEnterToSend);

  const sendMessage = useSendMessage();

  useAutoFocus(ref);

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
    <div className={styles.textareaContainer}>
      <TextArea
        autoFocus
        className={styles.textarea}
        onBlur={(e) => {
          updateInputMessage?.(e.target.value);
        }}
        onChange={(e) => {
          updateInputMessage?.(e.target.value);
        }}
        onCompositionEnd={() => {
          isChineseInput.current = false;
        }}
        onCompositionStart={() => {
          isChineseInput.current = true;
        }}
        onPressEnter={(e) => {
          if (loading || e.shiftKey || isChineseInput.current) return;

          // eslint-disable-next-line unicorn/consistent-function-scoping
          const send = () => {
            // avoid inserting newline when sending message.
            // refs: https://github.com/lobehub/lobe-chat/pull/989
            e.preventDefault();

            sendMessage();
            setExpand?.(false);
          };
          const commandKey = isCommandPressed(e);

          // when user like cmd + enter to send message
          if (useCmdEnterToSend) {
            if (commandKey) send();
          } else {
            // cmd + enter to wrap
            if (commandKey) {
              updateInputMessage?.((e.target as any).value + '\n');
              return;
            }

            send();
          }
        }}
        placeholder={t('sendPlaceholder')}
        ref={ref}
        type={'pure'}
        value={value}
      />
    </div>
  );
});

export default InputArea;
