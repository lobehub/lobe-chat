'use client';

import { Alert, Hotkey, Icon } from '@lobehub/ui';
import { BotMessageSquare, LucideCheck, MessageSquarePlus } from 'lucide-react';
import { Suspense, memo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { type ActionKeys, ChatInputProvider, DesktopChatInput } from '@/features/ChatInput';
import WideScreenContainer from '@/features/Conversation/components/WideScreenContainer';
import { useChatStore } from '@/store/chat';
import { aiChatSelectors } from '@/store/chat/selectors';
import { useUserStore } from '@/store/user';
import { preferenceSelectors, settingsSelectors } from '@/store/user/selectors';
import { HotkeyEnum, KeyEnum } from '@/types/hotkey';

import { useSend } from '../useSend';
import MessageFromUrl from './MessageFromUrl';

const leftActions: ActionKeys[] = [
  'model',
  'search',
  'typo',
  'fileUpload',
  'knowledgeBase',
  'tools',
  '---',
  ['params', 'history', 'stt', 'clear'],
  'mainToken',
];

const rightActions: ActionKeys[] = ['saveTopic'];

const ClassicChatInput = memo(() => {
  const { t } = useTranslation('chat');
  const { send, generating, disabled, stop } = useSend();
  const [useCmdEnterToSend, updatePreference] = useUserStore((s) => [
    preferenceSelectors.useCmdEnterToSend(s),
    s.updatePreference,
  ]);

  const [mainInputSendErrorMsg, clearSendMessageError] = useChatStore((s) => [
    aiChatSelectors.isCurrentSendMessageError(s),
    s.clearSendMessageError,
  ]);
  const hotkey = useUserStore(settingsSelectors.getHotkeyById(HotkeyEnum.AddUserMessage));

  return (
    <ChatInputProvider
      chatInputEditorRef={(instance) => {
        if (!instance) return;
        useChatStore.setState({ mainInputEditor: instance });
      }}
      leftActions={leftActions}
      onMarkdownContentChange={(content) => {
        useChatStore.setState({ inputMessage: content });
      }}
      onSend={() => {
        send();
      }}
      rightActions={rightActions}
      sendButtonProps={{ disabled, generating, onStop: stop }}
      sendMenu={{
        items: [
          {
            icon: !useCmdEnterToSend ? <Icon icon={LucideCheck} /> : <div />,
            key: 'sendWithEnter',
            label: (
              <Flexbox align={'center'} gap={4} horizontal>
                <Trans
                  components={{
                    key: <Hotkey keys={KeyEnum.Enter} variant={'borderless'} />,
                  }}
                  i18nKey={'input.sendWithEnter'}
                  ns={'chat'}
                />
              </Flexbox>
            ),
            onClick: () => {
              updatePreference({ useCmdEnterToSend: false });
            },
          },
          {
            icon: useCmdEnterToSend ? <Icon icon={LucideCheck} /> : <div />,
            key: 'sendWithCmdEnter',
            label: (
              <Flexbox align={'center'} gap={4} horizontal>
                <Trans
                  components={{
                    key: (
                      <Hotkey
                        keys={[KeyEnum.Mod, KeyEnum.Enter].join('+')}
                        variant={'borderless'}
                      />
                    ),
                  }}
                  i18nKey={'input.sendWithCmdEnter'}
                  ns={'chat'}
                />
              </Flexbox>
            ),
            onClick: () => {
              updatePreference({ useCmdEnterToSend: true });
            },
          },
          { type: 'divider' },
          {
            // disabled,
            icon: <Icon icon={BotMessageSquare} />,
            key: 'addAi',
            label: t('input.addAi'),
            onClick: () => {
              send({ onlyAddAIMessage: true });
            },
          },
          {
            // disabled,
            icon: <Icon icon={MessageSquarePlus} />,
            key: 'addUser',
            label: (
              <Flexbox align={'center'} gap={24} horizontal>
                {t('input.addUser')}
                <Hotkey keys={hotkey} />
              </Flexbox>
            ),
            onClick: () => {
              send({ onlyAddUserMessage: true });
            },
          },
        ],
      }}
    >
      <WideScreenContainer>
        {mainInputSendErrorMsg && (
          <Flexbox paddingBlock={'0 6px'} paddingInline={12}>
            <Alert
              closable
              message={t('input.errorMsg', { errorMsg: mainInputSendErrorMsg })}
              onClose={clearSendMessageError}
              type={'warning'}
            />
          </Flexbox>
        )}
        <DesktopChatInput />
      </WideScreenContainer>
      <Suspense>
        <MessageFromUrl />
      </Suspense>
    </ChatInputProvider>
  );
});

export default ClassicChatInput;
