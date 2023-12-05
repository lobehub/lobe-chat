import { Icon } from '@lobehub/ui';
import { Button } from 'antd';
import { useTheme } from 'antd-style';
import { ArrowBigUp, CornerDownLeft, Loader2 } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import SaveTopic from '@/app/chat/features/ChatInput/Topic';
import { useSendMessage } from '@/app/chat/features/ChatInput/useSend';
import { useChatStore } from '@/store/chat';
import { useSessionStore } from '@/store/session';
import { agentSelectors } from '@/store/session/selectors';

import { LocalFiles } from './LocalFiles';

const Footer = memo(() => {
  const { t } = useTranslation('chat');
  const theme = useTheme();
  const [loading, onStop] = useChatStore((s) => [!!s.chatLoadingId, s.stopGenerateMessage]);

  const onSend = useSendMessage();
  const canUpload = useSessionStore(agentSelectors.modelHasVisionAbility);

  return (
    <Flexbox
      align={'end'}
      distribution={'space-between'}
      flex={'none'}
      gap={8}
      horizontal
      padding={'0 24px'}
    >
      <Flexbox>{canUpload && <LocalFiles />}</Flexbox>
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
          <Button icon={loading && <Icon icon={Loader2} spin />} onClick={onStop}>
            {t('stop')}
          </Button>
        ) : (
          <Button onClick={() => onSend()} type={'primary'}>
            {t('send')}
          </Button>
        )}
      </Flexbox>
    </Flexbox>
  );
});

export default Footer;
