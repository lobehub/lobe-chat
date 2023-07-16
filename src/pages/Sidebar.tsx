import { ActionIcon, Logo, SideNav } from '@lobehub/ui';
import { MessageSquare, Settings2, Sticker } from 'lucide-react';
import Router from 'next/router';
import { memo } from 'react';
import { shallow } from 'zustand/shallow';

import { useSettings } from '@/store/settings';

const Sidebar = memo(() => {
  const [tab, setTab] = useSettings((s) => [s.sidebarKey, s.switchSideBar], shallow);
  return (
    <SideNav
      avatar={<Logo size={40} />}
      bottomActions={<ActionIcon icon={Settings2} onClick={() => Router.push('/setting')} />}
      style={{ height: '100vh' }}
      topActions={
        <>
          <ActionIcon
            active={tab === 'chat'}
            icon={MessageSquare}
            onClick={() => setTab('chat')}
            size="large"
          />
          <ActionIcon
            active={tab === 'market'}
            icon={Sticker}
            onClick={() => setTab('market')}
            size="large"
          />
        </>
      }
    />
  );
});

export default Sidebar;
