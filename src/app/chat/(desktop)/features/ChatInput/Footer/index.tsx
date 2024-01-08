import { Icon } from '@lobehub/ui';
import { Button } from 'antd';
import { useTheme } from 'antd-style';
import { ArrowBigUp, CornerDownLeft, Loader2 } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import SaveTopic from '@/features/ChatInput/Topic';
import { useSendMessage } from '@/features/ChatInput/useSend';
import { useChatStore } from '@/store/chat';
import { useSessionStore } from '@/store/session';
import { agentSelectors } from '@/store/session/selectors';

import { LocalFiles } from './LocalFiles';

const Footer = memo(() => {
  const { t } = useTranslation('chat');
  const theme = useTheme();
  const canUpload = useSessionStore(agentSelectors.modelHasVisionAbility);
  const [loading, stopGenerateMessage] = useChatStore((s) => [
    !!s.chatLoadingId,
    s.stopGenerateMessage,
  ]);
  const onSend = useSendMessage();

  return (
    <Flexbox
      align={'end'}
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
          <Button icon={loading && <Icon icon={Loader2} spin />} onClick={stopGenerateMessage}>
            {t('stop')}
          </Button>
        ) : (
          <Button onClick={onSend} type={'primary'}>
            {t('send')}
          </Button>
        )}
      </Flexbox>
    </Flexbox>
  );
});

export default Footer;
