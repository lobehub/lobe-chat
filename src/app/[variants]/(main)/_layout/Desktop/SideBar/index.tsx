'use client';

import { SideNav } from '@lobehub/ui';
import { useTheme } from 'antd-style';
import { parseAsBoolean, useQueryState } from 'nuqs';
import { Suspense, memo } from 'react';

import { isDesktop } from '@/const/version';
import { useActiveTabKey } from '@/hooks/useActiveTabKey';
import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';
import { featureFlagsSelectors, useServerConfigStore } from '@/store/serverConfig';
import { electronStylish } from '@/styles/electron';

import Avatar from './Avatar';
import BottomActions from './BottomActions';
import PinList from './PinList';
import TopActions from './TopActions';

const Top = () => {
  const [isPinned] = useQueryState('pinned', parseAsBoolean);
  const sidebarKey = useActiveTabKey();

  return <TopActions isPinned={isPinned} tab={sidebarKey} />;
};

const Nav = memo(() => {
  const theme = useTheme();
  const inZenMode = useGlobalStore(systemStatusSelectors.inZenMode);
  const { showPinList } = useServerConfigStore(featureFlagsSelectors);

  return (
    !inZenMode && (
      <SideNav
        avatar={<Avatar />}
        bottomActions={<BottomActions />}
        className={electronStylish.nodrag}
        style={{
          height: '100%',
          zIndex: 100,
          ...(isDesktop
            ? { background: 'transparent', borderInlineEnd: 0, paddingBlockStart: 8 }
            : { background: theme.colorBgLayout }),
        }}
        topActions={
          <Suspense>
            <Top />
            {showPinList && <PinList />}
          </Suspense>
        }
      />
    )
  );
});

Nav.displayName = 'DesktopNav';

export default Nav;
