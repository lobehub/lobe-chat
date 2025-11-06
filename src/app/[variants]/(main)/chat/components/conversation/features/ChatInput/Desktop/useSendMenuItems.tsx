'use client';

import { Hotkey, Icon, type MenuProps } from '@lobehub/ui';
import { BotMessageSquare, LucideCheck, MessageSquarePlus } from 'lucide-react';
import { useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useUserStore } from '@/store/user';
import { preferenceSelectors, settingsSelectors } from '@/store/user/selectors';
import { HotkeyEnum, KeyEnum } from '@/types/hotkey';

import { useSend } from '../useSend';

export const useSendMenuItems = (): MenuProps['items'] => {
  const { t } = useTranslation('chat');
  const { send } = useSend();
  const [useCmdEnterToSend, updatePreference] = useUserStore((s) => [
    preferenceSelectors.useCmdEnterToSend(s),
    s.updatePreference,
  ]);

  const hotkey = useUserStore(settingsSelectors.getHotkeyById(HotkeyEnum.AddUserMessage));

  return useMemo(
    () => [
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
                  <Hotkey keys={[KeyEnum.Mod, KeyEnum.Enter].join('+')} variant={'borderless'} />
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
    [useCmdEnterToSend, send, updatePreference, hotkey],
  );
};
