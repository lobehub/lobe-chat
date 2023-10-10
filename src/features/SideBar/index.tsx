import { SideNav } from '@lobehub/ui';
import { memo } from 'react';

import AvatarWithUpload from '@/features/AvatarWithUpload';
import { useGlobalStore } from '@/store/global';

import BottomActions from './BottomActions';
import TopActions from './TopActions';

export default memo(() => {
  const [tab, setTab] = useGlobalStore((s) => [s.sidebarKey, s.switchSideBar]);

  return (
    <SideNav
      avatar={<AvatarWithUpload id={'avatar'} />}
      bottomActions={<BottomActions setTab={setTab} tab={tab} />}
      style={{ height: '100%' }}
      topActions={<TopActions setTab={setTab} tab={tab} />}
    />
  );
});
