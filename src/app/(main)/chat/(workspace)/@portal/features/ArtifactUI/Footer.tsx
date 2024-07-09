import { ActionIcon, Icon } from '@lobehub/ui';
import { Button } from 'antd';
import { LucideBotMessageSquare, LucideNotepadText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useChatStore } from '@/store/chat';
import { chatPortalSelectors, chatSelectors } from '@/store/chat/selectors';

const Footer = () => {
  const [messageId, isAIGenerating, triggerAIMessage, summaryPluginContent] = useChatStore((s) => [
    chatPortalSelectors.artifactMessageId(s),
    chatSelectors.isAIGenerating(s),
    s.triggerAIMessage,
    s.summaryPluginContent,
  ]);
  const { t } = useTranslation('portal');

  return (
    <Flexbox gap={8} horizontal paddingBlock={12} paddingInline={12}>
      <Button
        icon={<Icon icon={LucideBotMessageSquare} />}
        loading={isAIGenerating}
        onClick={() => {
          triggerAIMessage({ parentId: messageId });
        }}
      >
        {t('actions.genAiMessage')}
      </Button>
      <ActionIcon
        icon={LucideNotepadText}
        loading={isAIGenerating}
        onClick={() => {
          if (!messageId) return;

          summaryPluginContent(messageId);
        }}
        title={t('actions.summaryTooltip')}
      />
    </Flexbox>
  );
};

export default Footer;
