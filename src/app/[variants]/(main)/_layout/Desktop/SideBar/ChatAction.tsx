import { ActionIcon, ActionIconProps } from '@lobehub/ui';
import { MessageSquare } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import InnerLink from '@/components/InnerLink';
import { SESSION_CHAT_URL } from '@/const/url';
import { SidebarTabKey } from '@/store/global/initialState';
import { useSessionStore } from '@/store/session';

const ICON_SIZE: ActionIconProps['size'] = {
  blockSize: 40,
  size: 24,
  strokeWidth: 2,
};

export interface ChatActionProps {
  isPinned?: boolean | null;
  tab?: SidebarTabKey;
}

const ChatAction = memo<ChatActionProps>(({ tab, isPinned }) => {
  const { t } = useTranslation('common');
  const activeId = useSessionStore((s) => s.activeId);

  // 从 store 中获取需要的数据
  const isChatActive = tab === SidebarTabKey.Chat && !isPinned;

  return (
    <InnerLink
      aria-label={t('tab.chat')}
      href={SESSION_CHAT_URL(activeId)}
      onClick={(e) => {
        // If Cmd key is pressed, let the default link behavior happen (open in new tab)
        if (e.metaKey || e.ctrlKey) {
          return;
        }
      }}
    >
      <ActionIcon
        active={isChatActive}
        icon={MessageSquare}
        size={ICON_SIZE}
        title={t('tab.chat')}
        tooltipProps={{ placement: 'right' }}
      />
    </InnerLink>
  );
});

export default ChatAction;
