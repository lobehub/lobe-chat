import { ActionIcon } from '@lobehub/ui';
import { Compass, MessageSquare, PanelLeftOpen, PanelLeftClose } from 'lucide-react';
import Link from 'next/link';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { usePathname } from 'next/navigation';

import { useGlobalStore } from '@/store/global';
import { SidebarTabKey } from '@/store/global/initialState';
import { useSessionStore } from '@/store/session';

export interface TopActionProps {
  tab?: SidebarTabKey;
}

const TopActions = memo<TopActionProps>(({ tab }) => {
  const { t } = useTranslation('common');
  const switchBackToChat = useGlobalStore((s) => s.switchBackToChat);
  const isChatPath = usePathname() === '/chat'; // 判断路径
  const showSessionPanel = useGlobalStore((s) => s.preference.showSessionPanel);

  return (
    <>
      <Link
        aria-label={t('tab.chat')}
        href={'/chat'}
        onClick={(e) => {
          e.preventDefault();
          switchBackToChat(useSessionStore.getState().activeId);
        }}
      >
        <ActionIcon
          active={tab === SidebarTabKey.Chat}
          icon={MessageSquare}
          placement={'right'}
          size="large"
          title={t('tab.chat')}
        />
      </Link>
      <Link aria-label={t('tab.market')} href={'/market'}>
        <ActionIcon
          active={tab === SidebarTabKey.Market}
          icon={Compass}
          placement={'right'}
          size="large"
          title={t('tab.market')}
        />
      </Link>
      {isChatPath && (
        <Link aria-label={t('tab.assistantsAndConversations')} href={'/chat'}>
          <ActionIcon
            active={isChatPath}
            icon={showSessionPanel ? PanelLeftClose : PanelLeftOpen} // 使用新的图标
            onClick={}    // 点击事件待添加
            placement={'right'}
            size="large"
            title={t('tab.assistantsAndConversations')}
          />
        </Link>
      )}
    </>
  );
});

export default TopActions;