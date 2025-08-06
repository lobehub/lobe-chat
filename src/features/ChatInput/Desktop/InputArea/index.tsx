import { TextArea } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { TextAreaRef } from 'antd/es/input/TextArea';
import { RefObject, memo, useEffect, useRef } from 'react';
import { useHotkeysContext } from 'react-hotkeys-hook';
import { useTranslation } from 'react-i18next';

import { isDesktop } from '@/const/version';
import { useUserStore } from '@/store/user';
import { preferenceSelectors } from '@/store/user/selectors';
import { HotkeyEnum } from '@/types/hotkey';
import { isCommandPressed } from '@/utils/keyboard';

import { useAutoFocus } from '../useAutoFocus';

const useStyles = createStyles(({ css }) => {
  return {
    textarea: css`
      resize: none !important;

      height: 100% !important;
      padding-block: 0;
      padding-inline: 16px;

      line-height: 1.5;

      box-shadow: none !important;
    `,
    textareaContainer: css`
      position: relative;
      flex: 1;
    `,
  };
});

interface InputAreaProps {
  loading?: boolean;
  onChange: (string: string) => void;
  onSend: () => void;
  value: string;
}

const InputArea = memo<InputAreaProps>(({ onSend, value, loading, onChange }) => {
  const { enableScope, disableScope } = useHotkeysContext();
  const { t } = useTranslation('chat');
  const { styles } = useStyles();

  const ref = useRef<TextAreaRef>(null);
  const isChineseInput = useRef(false);

  const useCmdEnterToSend = useUserStore(preferenceSelectors.useCmdEnterToSend);

  useAutoFocus(ref as RefObject<TextAreaRef>);

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
          onChange?.(e.target.value);
          disableScope(HotkeyEnum.AddUserMessage);
        }}
        onChange={(e) => {
          onChange?.(e.target.value);
        }}
        onCompositionEnd={() => {
          isChineseInput.current = false;
        }}
        onCompositionStart={() => {
          isChineseInput.current = true;
        }}
        onContextMenu={async (e) => {
          if (isDesktop) {
            e.preventDefault();
            const textArea = ref.current?.resizableTextArea?.textArea;
            const hasSelection = textArea && textArea.selectionStart !== textArea.selectionEnd;
            const { electronSystemService } = await import('@/services/electron/system');

            electronSystemService.showContextMenu('editor', {
              hasSelection: !!hasSelection,
              value: value,
            });
          }
        }}
        onFocus={() => {
          enableScope(HotkeyEnum.AddUserMessage);
        }}
        onPressEnter={(e) => {
          if (loading || e.altKey || e.shiftKey || isChineseInput.current) return;

          // eslint-disable-next-line unicorn/consistent-function-scoping
          const send = () => {
            // avoid inserting newline when sending message.
            // refs: https://github.com/lobehub/lobe-chat/pull/989
            e.preventDefault();

            onSend();
          };
          const commandKey = isCommandPressed(e);

          // when user like cmd + enter to send message
          if (useCmdEnterToSend) {
            if (commandKey) send();
          } else {
            // cmd + enter to wrap
            if (commandKey) {
              onChange?.((e.target as any).value + '\n');
              return;
            }

            send();
          }
        }}
        placeholder={t('sendPlaceholder')}
        ref={ref}
        value={value}
        variant={'borderless'}
      />
    </div>
  );
});

InputArea.displayName = 'DesktopInputArea';

export default InputArea;
