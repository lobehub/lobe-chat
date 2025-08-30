import {
  INSERT_TABLE_COMMAND,
  ReactCodeblockPlugin,
  ReactHRPlugin,
  ReactLinkPlugin,
  ReactListPlugin,
  ReactTablePlugin,
  useToolbarState,
} from '@lobehub/editor';
import { Editor, SlashMenu } from '@lobehub/editor/react';
import { Table2Icon } from 'lucide-react';
import { memo, useEffect, useRef } from 'react';
import { useHotkeysContext } from 'react-hotkeys-hook';
import { useTranslation } from 'react-i18next';

import { useUserStore } from '@/store/user';
import { preferenceSelectors } from '@/store/user/selectors';
import { HotkeyEnum } from '@/types/hotkey';
import { isCommandPressed } from '@/utils/keyboard';

import { useChatInput } from '../hooks/useChatInput';
import { useSend } from '../hooks/useSend';

const InputEditor = memo<{ defaultRows?: number }>(({ defaultRows = 2 }) => {
  const { editorRef, slashMenuRef } = useChatInput();
  const { send, canSend } = useSend();
  const state = useToolbarState(editorRef);
  const { enableScope, disableScope } = useHotkeysContext();
  const { t } = useTranslation(['editor', 'chat']);

  const isChineseInput = useRef(false);

  const useCmdEnterToSend = useUserStore(preferenceSelectors.useCmdEnterToSend);

  useEffect(() => {
    const fn = (e: BeforeUnloadEvent) => {
      if (!state.isEmpty) {
        // set returnValue to trigger alert modal
        // Note: No matter what value is set, the browser will display the standard text
        e.returnValue = '你有正在输入中的内容，确定要离开吗？';
      }
    };
    window.addEventListener('beforeunload', fn);
    return () => {
      window.removeEventListener('beforeunload', fn);
    };
  }, [state.isEmpty]);

  return (
    <Editor
      autoFocus
      content={''}
      editorRef={editorRef}
      onBlur={() => {
        disableScope(HotkeyEnum.AddUserMessage);
      }}
      onCompositionEnd={() => {
        isChineseInput.current = false;
      }}
      onCompositionStart={() => {
        isChineseInput.current = true;
      }}
      onFocus={() => {
        enableScope(HotkeyEnum.AddUserMessage);
      }}
      onPressEnter={({ event: e }) => {
        if (!canSend || e.altKey || e.shiftKey || isChineseInput.current) return;
        const commandKey = isCommandPressed(e);
        // when user like cmd + enter to send message
        if (commandKey) {
          if (useCmdEnterToSend) send();
        } else {
          send();
        }
      }}
      placeholder={t('sendPlaceholder', { ns: 'chat' })}
      plugins={[
        ReactListPlugin,
        ReactLinkPlugin,
        ReactCodeblockPlugin,
        ReactHRPlugin,
        ReactTablePlugin,
      ]}
      slashOption={{
        items: [
          {
            icon: Table2Icon,
            key: 'table',
            label: t('typobar.table'),
            onSelect: (editor) => {
              editor.dispatchCommand(INSERT_TABLE_COMMAND, { columns: '3', rows: '3' });
            },
          },
        ],
        renderComp: (props) => {
          return <SlashMenu {...props} getPopupContainer={() => (slashMenuRef as any)?.current} />;
        },
      }}
      style={{
        minHeight: defaultRows > 1 ? defaultRows * 23 : undefined,
      }}
      type={'text'}
      variant={'chat'}

      // TODO: enable context menu when electron support is ready
      // onContextMenu={async ({ event: e }) => {
      //   if (isDesktop) {
      //     e.preventDefault();
      //     const textArea = ref.current?.getRootElement();
      //     const hasSelection = textArea && textArea.selectionStart !== textArea.selectionEnd;
      //     const { electronSystemService } = await import('@/services/electron/system');
      //
      //     electronSystemService.showContextMenu('editor', {
      //       hasSelection: !!hasSelection,
      //       value: value,
      //     });
      //   }
      // }}
    />
  );
});

InputEditor.displayName = 'InputEditor';

export default InputEditor;
