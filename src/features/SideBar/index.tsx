import { ActionIcon, SideNav } from '@lobehub/ui';
import { MessageSquare, Settings2, Sticker } from 'lucide-react';
import Router from 'next/router';
import { memo } from 'react';
import { shallow } from 'zustand/shallow';

import AvatarWithUpload from '@/features/AvatarWithUpload';
import { useSettings } from '@/store/settings';

import BottomAction from './BottomAction';

export default memo(() => {
  const [tab, setTab] = useSettings((s) => [s.sidebarKey, s.switchSideBar], shallow);

  return (
    <SideNav
      avatar={<AvatarWithUpload />}
      bottomActions={
        <BottomAction>
          <ActionIcon active={tab === 'setting'} icon={Settings2} />
        </BottomAction>
      }
      style={{ height: '100vh' }}
      topActions={
        <>
          <ActionIcon
            active={tab === 'chat'}
            icon={MessageSquare}
            onClick={() => {
              // 如果已经在 chat 路径下了，那么就不用再跳转了
              if (Router.asPath.startsWith('/chat')) return;

              Router.push('/');
            }}
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
