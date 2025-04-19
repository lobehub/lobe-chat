import { ActionIcon, Icon } from '@lobehub/ui';
import { Button } from 'antd';
import { LucideNotepadText, PlusSquareIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useChatStore } from '@/store/chat';
import { chatPortalSelectors, chatSelectors } from '@/store/chat/selectors';

const Footer = () => {
  const [messageId, isAIGenerating, triggerAIMessage, saveSearchResult] = useChatStore((s) => [
    chatPortalSelectors.toolMessageId(s),
    chatSelectors.isAIGenerating(s),
    s.triggerAIMessage,
    s.saveSearchResult,
  ]);

  const { t } = useTranslation('tool');

  return (
    <Flexbox gap={8} horizontal paddingBlock={12} paddingInline={12}>
      <Button
        icon={<Icon icon={LucideNotepadText} />}
        loading={isAIGenerating}
        onClick={() => {
          if (!messageId) return;

          triggerAIMessage({});
        }}
      >
        {t('search.summaryTooltip')}
      </Button>
      <ActionIcon
        icon={PlusSquareIcon}
        loading={isAIGenerating}
        onClick={() => {
          if (!messageId) return;

          saveSearchResult(messageId);
        }}
        title={t('search.createNewSearch')}
      />
    </Flexbox>
  );
};

export default Footer;
