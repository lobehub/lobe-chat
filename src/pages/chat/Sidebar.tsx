import { useSettings } from '@/store/settings';
import { ActionIcon, Logo, SideNav } from '@lobehub/ui';
import { Album, MessageSquare, Settings2 } from 'lucide-react';
import { memo } from 'react';
import { shallow } from 'zustand/shallow';

const Sidebar = memo(() => {
  const [tab, setTab] = useSettings((s) => [s.sidebarKey, s.switchSideBar], shallow);
  return (
    <SideNav
      avatar={<Logo size={40} />}
      style={{ height: '100vh' }}
      topActions={
        <>
          <ActionIcon icon={MessageSquare} size="large" active={tab === 'chat'} onClick={() => setTab('chat')} />
          <ActionIcon icon={Album} size="large" active={tab === 'market'} onClick={() => setTab('market')} />
        </>
      }
      bottomActions={<ActionIcon icon={Settings2} />}
    />
  );
});

export default Sidebar;
