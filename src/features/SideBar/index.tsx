import { SideNav } from '@lobehub/ui';
import { memo } from 'react';
import { shallow } from 'zustand/shallow';

import AvatarWithUpload from '@/features/AvatarWithUpload';
import { useSettings } from '@/store/settings';

import BottomActions from './BottomActions';
import TopActions from './TopActions';

export default memo(() => {
  const [tab, setTab] = useSettings((s) => [s.sidebarKey, s.switchSideBar], shallow);

  return (
    <SideNav
      avatar={<AvatarWithUpload />}
      bottomActions={<BottomActions setTab={setTab} tab={tab} />}
      style={{ height: '100vh' }}
      topActions={<TopActions setTab={setTab} tab={tab} />}
    />
  );
});
