import { isDesktop } from '@lobechat/const';
import { HotkeyEnum, KeyEnum } from '@lobechat/types';
import { isCommandPressed } from '@lobechat/utils';
import {
  ReactCodePlugin,
  ReactCodeblockPlugin,
  ReactHRPlugin,
  ReactLinkPlugin,
  ReactListPlugin,
  ReactMathPlugin,
  ReactTablePlugin,
} from '@lobehub/editor';
import { Editor, FloatMenu, SlashMenu, useEditorState } from '@lobehub/editor/react';
import { combineKeys } from '@lobehub/ui';
import { memo, useEffect, useRef } from 'react';
import { useHotkeysContext } from 'react-hotkeys-hook';

import { useUserStore } from '@/store/user';
import { preferenceSelectors, settingsSelectors } from '@/store/user/selectors';

import { useChatInputStore, useStoreApi } from '../store';
import Placeholder from './Placeholder';
import { useSlashItems } from './useSlashItems';

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
  const slashItems = useSlashItems();

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
      placeholder={<Placeholder />}
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
        items: slashItems,
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
