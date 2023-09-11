import { useResponsive } from 'antd-style';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import AgentInfo from './AgentInfo';
import Desktop from './Desktop';
import Mobile from './Mobile';

const SideBar = memo(() => {
  const { mobile } = useResponsive();

  const Render = mobile ? Mobile : Desktop;

  return (
    <Render>
      <Flexbox>
        <AgentInfo />
      </Flexbox>
    </Render>
  );
});

export default SideBar;
