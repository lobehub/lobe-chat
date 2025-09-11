import { isDesktop } from '@lobechat/const';
import { HotkeyEnum, KeyEnum } from '@lobechat/types';
import { isCommandPressed } from '@lobechat/utils';
import {
  INSERT_TABLE_COMMAND,
  ReactCodePlugin,
  ReactCodeblockPlugin,
  ReactHRPlugin,
  ReactLinkPlugin,
  ReactListPlugin,
  ReactMathPlugin,
  ReactTablePlugin,
} from '@lobehub/editor';
import { Editor, FloatMenu, SlashMenu, useEditorState } from '@lobehub/editor/react';
import { Hotkey, combineKeys } from '@lobehub/ui';
import { Table2Icon } from 'lucide-react';
import { memo, useEffect, useRef } from 'react';
import { useHotkeysContext } from 'react-hotkeys-hook';
import { Trans, useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useUserStore } from '@/store/user';
import { preferenceSelectors, settingsSelectors } from '@/store/user/selectors';

import { useChatInputStore, useStoreApi } from '../store';

const InputEditor = memo<{ defaultRows?: number }>(() => {
  const [editor, slashMenuRef, send, updateMarkdownContent, expand] = useChatInputStore((s) => [
    s.editor,
    s.slashMenuRef,
    s.handleSendButton,
    s.updateMarkdownContent,
    s.expand,
  ]);

  const storeApi = useStoreApi();
  const state = useEditorState(editor);
  const hotkey = useUserStore(settingsSelectors.getHotkeyById(HotkeyEnum.AddUserMessage));
  const { enableScope, disableScope } = useHotkeysContext();
  const { t } = useTranslation(['editor', 'chat']);

  const isChineseInput = useRef(false);

  const useCmdEnterToSend = useUserStore(preferenceSelectors.useCmdEnterToSend);
  const wrapperShortcut = useCmdEnterToSend
    ? KeyEnum.Enter
    : combineKeys([KeyEnum.Mod, KeyEnum.Enter]);

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
        if (e.shiftKey || isChineseInput.current) return;
        // when user like alt + enter to add ai message
        if (e.altKey && hotkey === combineKeys([KeyEnum.Alt, KeyEnum.Enter])) return true;
        const commandKey = isCommandPressed(e);
        // when user like cmd + enter to send message
        if (useCmdEnterToSend) {
          if (commandKey) {
            send();
            return true;
          }
        } else {
          if (!commandKey) {
            send();
            return true;
          }
        }
      }}
      placeholder={
        <Flexbox align={'center'} as={'span'} gap={4} horizontal>
          {t('sendPlaceholder', { ns: 'chat' }).replace('...', ', ')}
          <Trans
            as={'span'}
            components={{
              key: (
                <Hotkey
                  as={'span'}
                  keys={wrapperShortcut}
                  style={{ color: 'inherit' }}
                  styles={{ kbdStyle: { color: 'inhert' } }}
                  variant={'borderless'}
                />
              ),
            }}
            i18nKey={'input.warpWithKey'}
            ns={'chat'}
          />
          {'...'}
        </Flexbox>
      }
      plugins={[
        ReactListPlugin,
        ReactLinkPlugin,
        ReactCodePlugin,
        ReactCodeblockPlugin,
        ReactHRPlugin,
        ReactTablePlugin,
        Editor.withProps(ReactMathPlugin, {
          renderComp: expand
            ? undefined
            : (props) => (
                <FloatMenu {...props} getPopupContainer={() => (slashMenuRef as any)?.current} />
              ),
        }),
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
        renderComp: expand
          ? undefined
          : (props) => {
              return (
                <SlashMenu {...props} getPopupContainer={() => (slashMenuRef as any)?.current} />
              );
            },
      }}
      type={'text'}
      variant={'chat'}
    />
  );
});

InputEditor.displayName = 'InputEditor';

export default InputEditor;
