'use client';

import { SideNav } from '@lobehub/ui';
import { memo } from 'react';

import { useActiveTabKey } from '@/hooks/useActiveTabKey';
import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';

import Avatar from './Avatar';
import BottomActions from './BottomActions';
import TopActions from './TopActions';

const Nav = memo(() => {
  const sidebarKey = useActiveTabKey();
  const inZenMode = useGlobalStore(systemStatusSelectors.inZenMode);

  return (
    !inZenMode && (
      <SideNav
        avatar={<Avatar />}
        bottomActions={<BottomActions />}
        style={{ height: '100%', zIndex: 100 }}
        topActions={<TopActions tab={sidebarKey} />}
      />
    )
  );
});

Nav.displayName = 'DesktopNav';

export default Nav;
