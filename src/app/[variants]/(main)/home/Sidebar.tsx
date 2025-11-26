import { memo } from 'react';

import { NavPanelPortal } from '@/features/NavPanel';
import Content from '@/features/NavPanel/Content';
import SessionHydration from '@/features/NavPanel/SessionHydration';

const Sidebar = memo(() => {
  return (
    <>
      <NavPanelPortal navKey="home">
        <Content />
      </NavPanelPortal>
      <SessionHydration />
    </>
  );
});

export default Sidebar;
