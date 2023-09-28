import { ActionIcon } from '@lobehub/ui';
import { Bot, MessageSquare } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { GlobalStore } from '@/store/global';
import { SidebarTabKey } from '@/store/global/initialState';
import { useSessionStore } from '@/store/session';

export interface TopActionProps {
  setTab: GlobalStore['switchSideBar'];
  tab: GlobalStore['sidebarKey'];
}

const TopActions = memo<TopActionProps>(({ tab, setTab }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useTranslation('common');
  const switchBackToChat = useSessionStore((s) => s.switchBackToChat);
  return (
    <>
      <ActionIcon
        active={tab === SidebarTabKey.Chat}
        icon={MessageSquare}
        onClick={() => {
          // 如果已经在 chat 路径下了，那么就不用再跳转了
          if (pathname?.startsWith('/chat')) return;
          switchBackToChat();
          setTab(SidebarTabKey.Chat);
        }}
        placement={'right'}
        size="large"
        title={t('tab.chat')}
      />
      <ActionIcon
        active={tab === SidebarTabKey.Market}
        icon={Bot}
        onClick={() => {
          if (pathname?.startsWith('/market')) return;
          router.push('/market');
          setTab(SidebarTabKey.Market);
        }}
        placement={'right'}
        size="large"
        title={t('tab.market')}
      />
    </>
  );
});

export default TopActions;
