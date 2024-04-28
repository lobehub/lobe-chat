import { Icon } from '@lobehub/ui';
import { Button, Dropdown } from 'antd';
import { createStyles } from 'antd-style';
import { BotMessageSquare, LucideCheck, LucideChevronDown, MessageSquarePlus } from 'lucide-react';
import { memo } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import HotKeys from '@/components/HotKeys';
import { ALT_KEY } from '@/const/hotkeys';
import { useSendMessage } from '@/features/ChatInput/useSend';
import { useChatStore } from '@/store/chat';
import { useUserStore } from '@/store/user';
import { preferenceSelectors } from '@/store/user/selectors';
import { isMacOS } from '@/utils/platform';

const useStyles = createStyles(({ css, prefixCls }) => {
  return {
    arrow: css`
      &.${prefixCls}-btn.${prefixCls}-btn-icon-only {
        width: 28px;
      }
    `,
  };
});

const isMac = isMacOS();

const SendMore = memo(() => {
  const { t } = useTranslation('chat');

  const { styles } = useStyles();

  const [useCmdEnterToSend, updatePreference] = useUserStore((s) => [
    preferenceSelectors.useCmdEnterToSend(s),
    s.updatePreference,
  ]);
  const addAIMessage = useChatStore((s) => s.addAIMessage);

  const sendMessage = useSendMessage();

  const hotKey = [ALT_KEY, 'enter'].join('+');
  useHotkeys(
    hotKey,
    (keyboardEvent, hotkeysEvent) => {
      console.log(keyboardEvent, hotkeysEvent);
      sendMessage(true);
    },
    {
      enableOnFormTags: true,
      preventDefault: true,
    },
  );

  return (
    <Dropdown
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
              meta: isMac ? 'Cmd' : 'Ctrl',
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
              <Flexbox gap={24} horizontal>
                {t('input.addUser')}
                <HotKeys keys={hotKey} />
              </Flexbox>
            ),
            onClick: () => {
              sendMessage(true);
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
