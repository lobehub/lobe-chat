import { SendButton as Send } from '@lobehub/editor/react';
import { Hotkey, Icon } from '@lobehub/ui';
import { BotMessageSquare, LucideCheck, MessageSquarePlus } from 'lucide-react';
import { memo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useUserStore } from '@/store/user';
import { preferenceSelectors, settingsSelectors } from '@/store/user/selectors';
import { HotkeyEnum, KeyEnum } from '@/types/hotkey';

import { useChatInput } from '../hooks/useChatInput';
import { useSend } from '../hooks/useSend';

const SendButton = memo(() => {
  const { t } = useTranslation('chat');
  const { mobile } = useChatInput();
  const { send, canSend, generating, stop } = useSend();

  const hotkey = useUserStore(settingsSelectors.getHotkeyById(HotkeyEnum.AddUserMessage));

  const [useCmdEnterToSend, updatePreference] = useUserStore((s) => [
    preferenceSelectors.useCmdEnterToSend(s),
    s.updatePreference,
  ]);

  return (
    <Send
      disabled={!generating && !canSend}
      generating={generating}
      menu={
        mobile
          ? undefined
          : {
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
                  icon: <Icon icon={BotMessageSquare} />,
                  key: 'addAi',
                  label: t('input.addAi'),
                  onClick: () => {
                    send({ onlyAddAIMessage: true });
                  },
                },
                {
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
            }
      }
      onClick={() => send()}
      onStop={() => stop()}
      placement={'topRight'}
      trigger={['hover']}
    />
  );
});

SendButton.displayName = 'SendButton';

export default SendButton;
