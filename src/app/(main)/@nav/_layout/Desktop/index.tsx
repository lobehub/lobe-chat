'use client';

import { SideNav } from '@lobehub/ui';
import { memo } from 'react';

import { useActiveTabKey } from '@/hooks/useActiveTabKey';
import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';
import { featureFlagsSelectors, useServerConfigStore } from '@/store/serverConfig';

import Avatar from './Avatar';
import BottomActions from './BottomActions';
import PinList from './PinList';
import TopActions from './TopActions';

const Nav = memo(() => {
  const sidebarKey = useActiveTabKey();
  const inZenMode = useGlobalStore(systemStatusSelectors.inZenMode);
  const { showPinList } = useServerConfigStore(featureFlagsSelectors);
  return (
    !inZenMode && (
      <SideNav
        avatar={<Avatar />}
        bottomActions={<BottomActions />}
        style={{ height: '100%', zIndex: 100 }}
        topActions={
          <>
            <TopActions tab={sidebarKey} />
            {showPinList && <PinList />}
          </>
        }
      />
    )
  );
});

Nav.displayName = 'DesktopNav';

export default Nav;
