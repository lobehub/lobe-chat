import { Button, Markdown, MaskShadow } from '@lobehub/ui';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useChatStore } from '@/store/chat';
import { useUserStore } from '@/store/user';
import { userGeneralSettingsSelectors } from '@/store/user/selectors';

interface CollapsedMessageProps {
  content: string;
  id: string;
}

export const CollapsedMessage = memo<CollapsedMessageProps>(({ id, content }) => {
  const { t } = useTranslation('chat');
  const fontSize = useUserStore(userGeneralSettingsSelectors.fontSize);
  const toggleMessageCollapsed = useChatStore((s) => s.toggleMessageCollapsed);

  return (
    <Flexbox>
      <MaskShadow>
        <Markdown fontSize={fontSize} variant={'chat'}>{content?.slice(0, 100)}</Markdown>
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
