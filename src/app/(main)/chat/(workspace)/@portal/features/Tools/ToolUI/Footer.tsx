import { Icon } from '@lobehub/ui';
import { Button } from 'antd';
import { LucideBotMessageSquare } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useChatStore } from '@/store/chat';
import { chatPortalSelectors, chatSelectors } from '@/store/chat/selectors';

const Footer = () => {
  const [messageId, triggerAIMessage, isAIGenerating] = useChatStore((s) => [
    chatPortalSelectors.toolUIMessageId(s),
    s.triggerAIMessage,
    chatSelectors.isAIGenerating(s),
  ]);
  const { t } = useTranslation('portal');

  return (
    <Flexbox horizontal paddingBlock={12} paddingInline={12}>
      <Button
        icon={<Icon icon={LucideBotMessageSquare} />}
        loading={isAIGenerating}
        onClick={() => {
          triggerAIMessage({ parentId: messageId });
        }}
      >
        {t('aiSummary')}
      </Button>
    </Flexbox>
  );
};

export default Footer;
