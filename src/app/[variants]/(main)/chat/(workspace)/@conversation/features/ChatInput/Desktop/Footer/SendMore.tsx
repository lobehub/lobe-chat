import { Hotkey, Icon } from '@lobehub/ui';
import { Button, Dropdown } from 'antd';
import { createStyles } from 'antd-style';
import { BotMessageSquare, LucideCheck, LucideChevronDown, MessageSquarePlus } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useSendMessage } from '@/features/ChatInput/useSend';
import { useChatStore } from '@/store/chat';
import { useUserStore } from '@/store/user';
import { preferenceSelectors, settingsSelectors } from '@/store/user/selectors';
import { HotkeyEnum } from '@/types/hotkey';

const useStyles = createStyles(({ css, prefixCls }) => {
  return {
    arrow: css`
      &.${prefixCls}-btn.${prefixCls}-btn-icon-only {
        width: 28px;
      }
    `,
  };
});

interface SendMoreProps {
  disabled?: boolean;
  isMac?: boolean;
}

const SendMore = memo<SendMoreProps>(({ disabled, isMac }) => {
  const { t } = useTranslation('chat');
  const hotkey = useUserStore(settingsSelectors.getHotkeyById(HotkeyEnum.AddUserMessage));
  const { styles } = useStyles();

  const [useCmdEnterToSend, updatePreference] = useUserStore((s) => [
    preferenceSelectors.useCmdEnterToSend(s),
    s.updatePreference,
  ]);
  const addAIMessage = useChatStore((s) => s.addAIMessage);

  const { send: sendMessage } = useSendMessage();

  return (
    <Dropdown
      disabled={disabled}
      menu={{
        items: [
          {
            icon: !useCmdEnterToSend ? <Icon icon={LucideCheck} /> : <div />,
            key: 'sendWithEnter',
            label: t('input.sendWithEnter'),
            onClick: () => {
              updatePreference({ useCmdEnterToSend: false });
            },
          },
          {
            icon: useCmdEnterToSend ? <Icon icon={LucideCheck} /> : <div />,
            key: 'sendWithCmdEnter',
            label: t('input.sendWithCmdEnter', {
              meta: typeof isMac === 'boolean' ? (isMac ? '⌘' : 'Ctrl') : '…',
            }),
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
              addAIMessage();
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
              sendMessage({ onlyAddUserMessage: true });
            },
          },
        ],
      }}
      placement={'topRight'}
      trigger={['hover']}
    >
      <Button
        aria-label={t('input.more')}
        className={styles.arrow}
        icon={<Icon icon={LucideChevronDown} />}
        type={'primary'}
      />
    </Dropdown>
  );
});

SendMore.displayName = 'SendMore';

export default SendMore;
