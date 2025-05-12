import { Button } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { rgba } from 'polished';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import StopLoadingIcon from '@/components/StopLoading';
import { useChatStore } from '@/store/chat';
import { threadSelectors } from '@/store/chat/selectors';

import { useSendThreadMessage } from './useSend';

const useStyles = createStyles(({ css, prefixCls, token }) => {
  return {
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
  onExpandChange: (expand: boolean) => void;
}

const Footer = memo<FooterProps>(({ onExpandChange }) => {
  const { t } = useTranslation('chat');

  const { styles } = useStyles();

  const [isAIGenerating, stopGenerateMessage] = useChatStore((s) => [
    threadSelectors.isThreadAIGenerating(s),
    s.stopGenerateMessage,
  ]);

  const { send: sendMessage, canSend } = useSendThreadMessage();

  return (
    <Flexbox
      align={'end'}
      className={styles.overrideAntdIcon}
      distribution={'space-between'}
      flex={'none'}
      gap={8}
      horizontal
      paddingInline={16}
    >
      <div />
      {isAIGenerating ? (
        <Button
          className={styles.loadingButton}
          icon={<StopLoadingIcon />}
          onClick={stopGenerateMessage}
        >
          {t('input.stop')}
        </Button>
      ) : (
        <Button
          disabled={!canSend}
          loading={!canSend}
          onClick={() => {
            sendMessage();
            onExpandChange?.(false);
          }}
          type={'primary'}
        >
          {t('input.send')}
        </Button>
      )}
    </Flexbox>
  );
});

Footer.displayName = 'Footer';

export default Footer;
