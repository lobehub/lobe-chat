import { Icon } from '@lobehub/ui';
import { Button, Dropdown, Space } from 'antd';
import { createStyles } from 'antd-style';
import {
  ChevronUp,
  CornerDownLeft,
  LucideCheck,
  LucideChevronDown,
  LucideCommand,
  LucidePlus,
} from 'lucide-react';
import { rgba } from 'polished';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Center, Flexbox } from 'react-layout-kit';

import StopLoadingIcon from '@/components/StopLoading';
import SaveTopic from '@/features/ChatInput/Topic';
import { useSendMessage } from '@/features/ChatInput/useSend';
import { useChatStore } from '@/store/chat';
import { useGlobalStore } from '@/store/global';
import { modelProviderSelectors, preferenceSelectors } from '@/store/global/selectors';
import { useSessionStore } from '@/store/session';
import { agentSelectors } from '@/store/session/selectors';
import { isMacOS } from '@/utils/platform';

import DragUpload from './DragUpload';
import { LocalFiles } from './LocalFiles';

const useStyles = createStyles(({ css, prefixCls, token }) => {
  return {
    arrow: css`
      &.${prefixCls}-btn.${prefixCls}-btn-icon-only {
        width: 28px;
      }
    `,
    loadingButton: css`
      display: flex;
      align-items: center;
    `,
    overrideAntdIcon: css`
      .${prefixCls}-btn.${prefixCls}-btn-icon-only {
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .${prefixCls}-btn.${prefixCls}-dropdown-trigger {
        &::before {
          background-color: ${rgba(token.colorBgLayout, 0.1)} !important;
        }
      }
    `,
  };
});

const isMac = isMacOS();

interface FooterProps {
  setExpand?: (expand: boolean) => void;
}

const Footer = memo<FooterProps>(({ setExpand }) => {
  const { t } = useTranslation('chat');

  const { theme, styles } = useStyles();

  const [loading, stopGenerateMessage] = useChatStore((s) => [
    !!s.chatLoadingId,
    s.stopGenerateMessage,
  ]);
  const [useCmdEnterToSend, updatePreference] = useGlobalStore((s) => [
    preferenceSelectors.useCmdEnterToSend(s),
    s.updatePreference,
  ]);

  const model = useSessionStore(agentSelectors.currentAgentModel);
  const canUpload = useGlobalStore(modelProviderSelectors.isModelEnabledUpload(model));

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
        {canUpload && (
          <>
            <DragUpload />
            <LocalFiles />
          </>
        )}
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
            <Button
              className={styles.loadingButton}
              icon={<StopLoadingIcon />}
              onClick={stopGenerateMessage}
            >
              {t('input.stop')}
            </Button>
          ) : (
            <Space.Compact>
              <Button
                onClick={() => {
                  sendMessage();
                  setExpand?.(false);
                }}
                type={'primary'}
              >
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
                  aria-label={t('input.more')}
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

Footer.displayName = 'Footer';

export default Footer;
