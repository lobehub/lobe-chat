import { Icon } from '@lobehub/ui';
import { Button } from 'antd';
import { createStyles } from 'antd-style';
import { ArrowBigUp, CornerDownLeft, Loader2 } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import SaveTopic from '@/app/chat/features/ChatInput/Topic';
import { useSessionStore } from '@/store/session';

import { useSendMessage } from './useSend';

const useStyles = createStyles(({ css }) => ({
  footerBar: css`
    display: flex;
    flex: none;
    gap: 8px;
    align-items: center;
    justify-content: flex-end;

    padding: 0 24px;
  `,
}));

const Footer = memo(() => {
  const { t } = useTranslation('chat');
  const { styles, theme } = useStyles();
  const [loading, onStop] = useSessionStore((s) => [!!s.chatLoadingId, s.stopGenerateMessage]);

  const onSend = useSendMessage();

  return (
    <div className={styles.footerBar}>
      <Flexbox
        gap={4}
        horizontal
        style={{ color: theme.colorTextDescription, fontSize: 12, marginRight: 12 }}
      >
        <Icon icon={CornerDownLeft} />
        <span>{t('send')}</span>
        <span>/</span>
        <Flexbox horizontal>
          <Icon icon={ArrowBigUp} />
          <Icon icon={CornerDownLeft} />
        </Flexbox>
        <span>{t('warp')}</span>
      </Flexbox>
      <SaveTopic />
      {loading ? (
        <Button icon={loading && <Icon icon={Loader2} spin />} onClick={onStop}>
          {t('stop')}
        </Button>
      ) : (
        <Button onClick={() => onSend()} type={'primary'}>
          {t('send')}
        </Button>
      )}
    </div>
  );
});

export default Footer;
