import { Icon } from '@lobehub/ui';
import { Button, Skeleton, Space } from 'antd';
import { createStyles } from 'antd-style';
import { ChevronUp, CornerDownLeft, LucideCommand } from 'lucide-react';
import { rgba } from 'polished';
import { memo, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Center, Flexbox } from 'react-layout-kit';

import StopLoadingIcon from '@/components/StopLoading';
import SaveTopic from '@/features/ChatInput/Topic';
import { useSendMessage } from '@/features/ChatInput/useSend';
import { useChatStore } from '@/store/chat';
import { chatSelectors, topicSelectors } from '@/store/chat/selectors';
import { filesSelectors, useFileStore } from '@/store/file';
import { useUserStore } from '@/store/user';
import { preferenceSelectors } from '@/store/user/selectors';
import { isMacOS } from '@/utils/platform';

import LocalFiles from '../LocalFiles';
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

interface FooterProps {
  expand: boolean;
  setExpand?: (expand: boolean) => void;
}

const Footer = memo<FooterProps>(({ setExpand, expand }) => {
  const { t } = useTranslation('chat');

  const { theme, styles } = useStyles();

  const [
    isAIGenerating,
    isHasMessageLoading,
    isCreatingMessage,
    isCreatingTopic,
    stopGenerateMessage,
  ] = useChatStore((s) => [
    chatSelectors.isAIGenerating(s),
    chatSelectors.isHasMessageLoading(s),
    chatSelectors.isCreatingMessage(s),
    topicSelectors.isCreatingTopic(s),
    s.stopGenerateMessage,
  ]);

  const isImageUploading = useFileStore(filesSelectors.isImageUploading);

  const [useCmdEnterToSend] = useUserStore((s) => [preferenceSelectors.useCmdEnterToSend(s)]);

  const sendMessage = useSendMessage();

  const [isMac, setIsMac] = useState<boolean>();
  useEffect(() => {
    setIsMac(isMacOS());
  }, [setIsMac]);

  const cmdEnter = (
    <Flexbox gap={2} horizontal>
      {typeof isMac === 'boolean' ? (
        <Icon icon={isMac ? LucideCommand : ChevronUp} />
      ) : (
        <Skeleton.Node active style={{ height: '100%', width: 12 }}>
          {' '}
        </Skeleton.Node>
      )}
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

  const buttonDisabled =
    isImageUploading || isHasMessageLoading || isCreatingTopic || isCreatingMessage;

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
        {expand && <LocalFiles />}
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
                disabled={buttonDisabled}
                loading={buttonDisabled}
                onClick={() => {
                  sendMessage();
                  setExpand?.(false);
                }}
                type={'primary'}
              >
                {t('input.send')}
              </Button>
              <SendMore disabled={buttonDisabled} isMac={isMac} />
            </Space.Compact>
          )}
        </Flexbox>
      </Flexbox>
    </Flexbox>
  );
});

Footer.displayName = 'Footer';

export default Footer;
