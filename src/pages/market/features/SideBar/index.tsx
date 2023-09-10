import { useResponsive } from 'antd-style';
import { memo, useCallback } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useMarketStore } from '@/store/market';

import AgentInfo from './AgentInfo';
import Desktop from './Desktop';
import Mobile from './Mobile';

const SideBar = memo(() => {
  const { mobile } = useResponsive();
  const agentManifestUrl = useMarketStore((s) => s.agentManifestUrl);
  const Render = mobile ? Mobile : Desktop;

  const Inner = useCallback(
    () => agentManifestUrl && <AgentInfo url={agentManifestUrl} />,
    [agentManifestUrl],
  );

  return (
    <Render>
      <Flexbox>
        <Inner />
      </Flexbox>
    </Render>
  );
});

export default SideBar;
