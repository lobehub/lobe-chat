import { isDesktop } from '@lobechat/const';
import { HotkeyEnum } from '@lobechat/types';
import { isCommandPressed } from '@lobechat/utils';
import {
  INSERT_TABLE_COMMAND,
  ReactCodeblockPlugin,
  ReactHRPlugin,
  ReactLinkPlugin,
  ReactListPlugin,
  ReactTablePlugin,
} from '@lobehub/editor';
import { Editor, SlashMenu, useEditorState } from '@lobehub/editor/react';
import { Table2Icon } from 'lucide-react';
import { memo, useEffect, useRef } from 'react';
import { useHotkeysContext } from 'react-hotkeys-hook';
import { useTranslation } from 'react-i18next';

import { useUserStore } from '@/store/user';
import { preferenceSelectors } from '@/store/user/selectors';

import { useChatInputStore, useStoreApi } from '../store';

const InputEditor = memo<{ defaultRows?: number }>(({ defaultRows = 2 }) => {
  const [editor, slashMenuRef, send, updateMarkdownContent] = useChatInputStore((s) => [
    s.editor,
    s.slashMenuRef,
    s.handleSendButton,
    s.updateMarkdownContent,
  ]);

  const storeApi = useStoreApi();

  const state = useEditorState(editor);
  const { enableScope, disableScope } = useHotkeysContext();
  const { t } = useTranslation(['editor', 'chat']);

  const isChineseInput = useRef(false);

  const useCmdEnterToSend = useUserStore(preferenceSelectors.useCmdEnterToSend);

  useEffect(() => {
    const fn = (e: BeforeUnloadEvent) => {
      if (!state.isEmpty) {
        // set returnValue to trigger alert modal
        // Note: No matter what value is set, the browser will display the standard text
        e.returnValue = 'You are typing something, are you sure you want to leave?';
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
      editor={editor}
      onBlur={() => {
        disableScope(HotkeyEnum.AddUserMessage);
      }}
      onChange={() => {
        updateMarkdownContent();
      }}
      onCompositionEnd={() => {
        isChineseInput.current = false;
      }}
      onCompositionStart={() => {
        isChineseInput.current = true;
      }}
      onContextMenu={async ({ event: e, editor }) => {
        if (isDesktop) {
          e.preventDefault();
          const { electronSystemService } = await import('@/services/electron/system');

          const selectionValue = editor.getSelectionDocument('markdown') as unknown as string;
          const hasSelection = !!selectionValue;

          await electronSystemService.showContextMenu('editor', {
            hasSelection,
            value: selectionValue,
          });
        }
      }}
      onFocus={() => {
        enableScope(HotkeyEnum.AddUserMessage);
      }}
      onInit={(editor) => storeApi.setState({ editor })}
      onPressEnter={({ event: e }) => {
        if (e.altKey || e.shiftKey || isChineseInput.current) return;
        const commandKey = isCommandPressed(e);
        // when user like cmd + enter to send message
        if (useCmdEnterToSend) {
          if (commandKey) send();
        } else {
          if (!commandKey) send();
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
    />
  );
});

InputEditor.displayName = 'InputEditor';

export default InputEditor;
