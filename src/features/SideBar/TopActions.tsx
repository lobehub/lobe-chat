import { ActionIcon } from '@lobehub/ui';
import { MessageSquare, Sticker } from 'lucide-react';
import Router from 'next/router';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { GlobalStore } from '@/store/global';
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
      <ActionIcon
        active={tab === 'chat'}
        icon={MessageSquare}
        onClick={() => {
          // 如果已经在 chat 路径下了，那么就不用再跳转了
          if (Router.asPath.startsWith('/chat')) return;
          switchBackToChat();
          setTab('chat');
        }}
        placement={'right'}
        size="large"
        title={t('tab.chat')}
      />
      <ActionIcon
        active={tab === 'market'}
        icon={Sticker}
        onClick={() => {
          if (Router.asPath.startsWith('/market')) return;
          Router.push('/market');
          setTab('market');
        }}
        placement={'right'}
        size="large"
        title={t('tab.market')}
      />
    </>
  );
});

export default TopActions;
