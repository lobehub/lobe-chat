import { useResponsive } from 'antd-style';
import { memo } from 'react';

import { InspectorContent } from '../../../components/Inspector';
import Mobile from '../../../components/Inspector/Mobile';
import Desktop from './Desktop';

const SideBar = memo(() => {
  const { mobile } = useResponsive();

  const Render = mobile ? Mobile : Desktop;

  return (
    <Render>
      <InspectorContent />
    </Render>
  );
});

export default SideBar;
