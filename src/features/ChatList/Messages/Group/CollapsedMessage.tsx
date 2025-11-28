import { Button, Markdown, MaskShadow } from '@lobehub/ui';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useChatStore } from '@/store/chat';

interface CollapsedMessageProps {
  content: string;
  id: string;
}

export const CollapsedMessage = memo<CollapsedMessageProps>(({ id, content }) => {
  const { t } = useTranslation('chat');
  const toggleMessageCollapsed = useChatStore((s) => s.toggleMessageCollapsed);

  return (
    <Flexbox>
      <MaskShadow>
        <Markdown variant={'chat'}>{content?.slice(0, 300)}</Markdown>
      </MaskShadow>
      <Flexbox padding={4}>
        <Button
          block
          color={'default'}
          onClick={() => {
            toggleMessageCollapsed(id, false);
          }}
          size={'small'}
          variant={'filled'}
        >
          {t('chatList.expandMessage')}
        </Button>
      </Flexbox>
    </Flexbox>
  );
});
