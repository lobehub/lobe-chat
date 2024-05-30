import { Icon } from '@lobehub/ui';
import { Button, Space } from 'antd';
import { createStyles } from 'antd-style';
import { ChevronUp, CornerDownLeft, LucideCommand } from 'lucide-react';
import { rgba } from 'polished';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Center, Flexbox } from 'react-layout-kit';

import StopLoadingIcon from '@/components/StopLoading';
import SaveTopic from '@/features/ChatInput/Topic';
import { useSendMessage } from '@/features/ChatInput/useSend';
import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/slices/chat';
import { useChatStore } from '@/store/chat';
import { chatSelectors } from '@/store/chat/selectors';
import { filesSelectors, useFileStore } from '@/store/file';
import { useUserStore } from '@/store/user';
import { modelProviderSelectors, preferenceSelectors } from '@/store/user/selectors';
import { isMacOS } from '@/utils/platform';

import DragUpload from './DragUpload';
import { LocalFiles } from './LocalFiles';
import SendMore from './SendMore';

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

  const [isAIGenerating, stopGenerateMessage] = useChatStore((s) => [
    chatSelectors.isAIGenerating(s),
    s.stopGenerateMessage,
  ]);
  const isImageUploading = useFileStore(filesSelectors.isImageUploading);

  const model = useAgentStore(agentSelectors.currentAgentModel);

  const [useCmdEnterToSend, canUpload] = useUserStore((s) => [
    preferenceSelectors.useCmdEnterToSend(s),
    modelProviderSelectors.isModelEnabledUpload(model)(s),
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
      <Flexbox align={'center'} gap={8} horizontal style={{ overflow: 'hidden' }}>
        {canUpload && (
          <>
            <DragUpload />
            <LocalFiles />
          </>
        )}
      </Flexbox>
      <Flexbox align={'center'} flex={'none'} gap={8} horizontal>
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
          {isAIGenerating ? (
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
                disabled={isImageUploading}
                onClick={() => {
                  sendMessage();
                  setExpand?.(false);
                }}
                type={'primary'}
              >
                {t('input.send')}
              </Button>
              <SendMore disabled={isImageUploading} />
            </Space.Compact>
          )}
        </Flexbox>
      </Flexbox>
    </Flexbox>
  );
});

Footer.displayName = 'Footer';

export default Footer;
