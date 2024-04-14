import { SideNav } from '@lobehub/ui';
import { memo } from 'react';

import { SidebarTabKey } from '@/store/global/initialState';

import Avatar from './Avatar';
import BottomActions from './BottomActions';
import TopActions from './TopActions';

interface Props {
  sidebarKey?: SidebarTabKey;
}

export default memo<Props>(({ sidebarKey }) => {
  return (
    <SideNav
      avatar={<Avatar />}
      bottomActions={<BottomActions tab={sidebarKey} />}
      style={{ height: '100%' }}
      topActions={<TopActions tab={sidebarKey} />}
    />
  );
});
