'use client';

import { useResponsive } from 'antd-style';
import { useQueryState } from 'nuqs';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { McpNavKey } from '@/types/discover';

import Sidebar from '../Sidebar';
import Deployment from './Deployment';
import Nav from './Nav';
import Overview from './Overview';
import Related from './Related';
import Schema from './Schema';
import Score from './Score';
import Versions from './Versions';

const Details = memo<{ mobile?: boolean }>(({ mobile: isMobile }) => {
  const { mobile = isMobile } = useResponsive();
  const [activeTab, setActiveTab] = useQueryState('activeTab', {
    clearOnDefault: true,
    defaultValue: McpNavKey.Overview,
  });

  return (
    <Flexbox gap={24}>
      <Nav activeTab={activeTab as McpNavKey} mobile={mobile} setActiveTab={setActiveTab} />
      <Flexbox
        gap={48}
        horizontal={!mobile}
        style={mobile ? { flexDirection: 'column-reverse' } : undefined}
      >
        <Flexbox
          flex={1}
          style={{
            overflow: 'hidden',
          }}
          width={'100%'}
        >
          {activeTab === McpNavKey.Overview && <Overview />}
          {activeTab === McpNavKey.Deployment && <Deployment mobile={mobile} />}
          {activeTab === McpNavKey.Schema && <Schema />}
          {activeTab === McpNavKey.Related && <Related />}
          {activeTab === McpNavKey.Score && <Score />}
          {activeTab === McpNavKey.Version && <Versions />}
        </Flexbox>
        <Sidebar mobile={mobile} />
      </Flexbox>
    </Flexbox>
  );
});

export default Details;
