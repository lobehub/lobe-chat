'use client';

import { SideNav } from '@lobehub/ui';
import { memo } from 'react';

import UserPanel from '@/app/(main)/@nav/features/UserPanel';
import UserAvatar from '@/features/User/UserAvatar';
import { useActiveTabKey } from '@/hooks/useActiveTabKey';

import BottomActions from './BottomActions';
import TopActions from './TopActions';

const Nav = memo(() => {
  const sidebarKey = useActiveTabKey();
  return (
    <SideNav
      avatar={
        <UserPanel>
          <UserAvatar />
        </UserPanel>
      }
      bottomActions={<BottomActions tab={sidebarKey} />}
      style={{ height: '100%' }}
      topActions={<TopActions tab={sidebarKey} />}
    />
  );
});

Nav.displayName = 'DesktopNav';

export default Nav;
