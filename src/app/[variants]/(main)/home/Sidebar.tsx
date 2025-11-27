import { memo } from 'react';

import { NavPanelPortal } from '@/features/NavPanel';
import Content from '@/features/NavPanel/Content';

const Sidebar = memo(() => {
  return (
    <NavPanelPortal navKey="home">
      <Content />
    </NavPanelPortal>
  );
});

export default Sidebar;
