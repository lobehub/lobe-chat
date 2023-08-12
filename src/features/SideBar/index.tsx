import { SideNav } from '@lobehub/ui';
import { memo } from 'react';
import { useSettings } from 'src/store/global';

import AvatarWithUpload from '@/features/AvatarWithUpload';

import BottomActions from './BottomActions';
import TopActions from './TopActions';

export default memo(() => {
  const [tab, setTab] = useSettings((s) => [s.sidebarKey, s.switchSideBar]);

  return (
    <SideNav
      avatar={<AvatarWithUpload />}
      bottomActions={<BottomActions setTab={setTab} tab={tab} />}
      style={{ height: '100vh' }}
      topActions={<TopActions setTab={setTab} tab={tab} />}
    />
  );
});
