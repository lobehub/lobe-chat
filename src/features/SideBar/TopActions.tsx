import { ActionIcon } from '@lobehub/ui';
import { Bot, MessageSquare } from 'lucide-react';
import Link from 'next/link';
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
  const { t } = useTranslation('common');
  const switchBackToChat = useSessionStore((s) => s.switchBackToChat);

  return (
    <>
      <Link
        href={'/chat'}
        onClick={(e) => {
          e.preventDefault();
          switchBackToChat();
          setTab(SidebarTabKey.Chat);
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
      <Link href={'/market'}>
        <ActionIcon
          active={tab === SidebarTabKey.Market}
          icon={Bot}
          onClick={() => {
            setTab(SidebarTabKey.Market);
          }}
          placement={'right'}
          size="large"
          title={t('tab.market')}
        />
      </Link>
    </>
  );
});

export default TopActions;
