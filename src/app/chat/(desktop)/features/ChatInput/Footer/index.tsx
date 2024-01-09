import { Icon } from '@lobehub/ui';
import { Button, Dropdown, Space } from 'antd';
import { createStyles } from 'antd-style';
import {
  ChevronUp,
  CornerDownLeft,
  Loader2,
  LucideCheck,
  LucideChevronDown,
  LucideCommand,
  LucidePlus,
} from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Center, Flexbox } from 'react-layout-kit';

import SaveTopic from '@/features/ChatInput/Topic';
import { useSendMessage } from '@/features/ChatInput/useSend';
import { useChatStore } from '@/store/chat';
import { useGlobalStore } from '@/store/global';
import { preferenceSelectors } from '@/store/global/selectors';
import { useSessionStore } from '@/store/session';
import { agentSelectors } from '@/store/session/selectors';
import { isMacOS } from '@/utils/platform';

import { LocalFiles } from './LocalFiles';

const useStyles = createStyles(({ css, prefixCls }) => {
  return {
    arrow: css`
      &.${prefixCls}-btn.${prefixCls}-btn-icon-only {
        width: 28px;
      }
    `,
    overrideAntdIcon: css`
      .${prefixCls}-btn.${prefixCls}-btn-icon-only {
        display: flex;
        align-items: center;
        justify-content: center;
      }
    `,
  };
});

const isMac = isMacOS();

const Footer = memo(() => {
  const { t } = useTranslation('chat');

  const { theme, styles } = useStyles();
  const canUpload = useSessionStore(agentSelectors.modelHasVisionAbility);
  const [loading, stopGenerateMessage] = useChatStore((s) => [
    !!s.chatLoadingId,
    s.stopGenerateMessage,
  ]);
  const [useCmdEnterToSend, updatePreference] = useGlobalStore((s) => [
    preferenceSelectors.useCmdEnterToSend(s),
    s.updatePreference,
  ]);
  const sendMessage = useSendMessage();

  const cmdEnter = (
    <Flexbox gap={2} horizontal>
      <Icon icon={isMac ? LucideCommand : ChevronUp} />
      <Icon icon={CornerDownLeft} />
    </Flexbox>
  );

  const enter = (
    <Center>
      <Icon icon={CornerDownLeft} />
    </Center>
  );

  const sendShortcut = useCmdEnterToSend ? cmdEnter : enter;

  const wrapperShortcut = useCmdEnterToSend ? enter : cmdEnter;

  return (
    <Flexbox
      align={'end'}
      className={styles.overrideAntdIcon}
      distribution={'space-between'}
      flex={'none'}
      gap={8}
      horizontal
      padding={'0 24px'}
    >
      <Flexbox align={'center'} gap={8} horizontal>
        {canUpload && <LocalFiles />}
      </Flexbox>
      <Flexbox align={'center'} gap={8} horizontal>
        <Flexbox
          gap={4}
          horizontal
          style={{ color: theme.colorTextDescription, fontSize: 12, marginRight: 12 }}
        >
          {sendShortcut}
          <span>{t('input.send')}</span>
          <span>/</span>
          {wrapperShortcut}
          <span>{t('input.warp')}</span>
        </Flexbox>
        <SaveTopic />
        <Flexbox style={{ minWidth: 92 }}>
          {loading ? (
            <Button icon={loading && <Icon icon={Loader2} spin />} onClick={stopGenerateMessage}>
              {t('input.stop')}
            </Button>
          ) : (
            <Space.Compact>
              <Button onClick={() => sendMessage()} type={'primary'}>
                {t('input.send')}
              </Button>
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
                      icon: <Icon icon={LucidePlus} />,
                      key: 'onlyAdd',
                      label: t('input.onlyAdd'),
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
                  className={styles.arrow}
                  icon={<Icon icon={LucideChevronDown} />}
                  type={'primary'}
                />
              </Dropdown>
            </Space.Compact>
          )}
        </Flexbox>
      </Flexbox>
    </Flexbox>
  );
});

export default Footer;
