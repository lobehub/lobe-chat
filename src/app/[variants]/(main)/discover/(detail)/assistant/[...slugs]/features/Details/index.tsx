'use client';

import { useResponsive } from 'antd-style';
import { useQueryState } from 'nuqs';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { AssistantNavKey } from '@/types/discover';

import Sidebar from '../Sidebar';
import Capabilities from './Capabilities';
import Nav from './Nav';
import Overview from './Overview';
import Related from './Related';
import SystemRole from './SystemRole';

const Details = memo<{ mobile?: boolean }>(({ mobile: isMobile }) => {
  const { mobile = isMobile } = useResponsive();
  const [activeTab, setActiveTab] = useQueryState('activeTab', {
    clearOnDefault: true,
    defaultValue: AssistantNavKey.Overview,
  });

  return (
    <Flexbox gap={24}>
      <Nav activeTab={activeTab as AssistantNavKey} mobile={mobile} setActiveTab={setActiveTab} />
      <Flexbox
        gap={48}
        horizontal={!mobile}
        style={mobile ? { flexDirection: 'column-reverse' } : undefined}
      >
        <Flexbox
          style={{
            overflow: 'hidden',
          }}
          width={'100%'}
        >
          {activeTab === AssistantNavKey.Overview && <Overview />}
          {activeTab === AssistantNavKey.SystemRole && <SystemRole />}
          {activeTab === AssistantNavKey.Capabilities && <Capabilities />}
          {activeTab === AssistantNavKey.Related && <Related />}
        </Flexbox>
        <Sidebar mobile={mobile} />
      </Flexbox>
    </Flexbox>
  );
});

export default Details;
