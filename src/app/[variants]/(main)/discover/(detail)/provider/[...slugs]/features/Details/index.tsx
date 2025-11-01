'use client';

import { useResponsive } from 'antd-style';
import { useQueryState } from 'nuqs';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { ProviderNavKey } from '@/types/discover';

import Sidebar from '../Sidebar';
import Guide from './Guide';
import Nav from './Nav';
import Overview from './Overview';
import Related from './Related';

const Details = memo<{ mobile?: boolean }>(({ mobile: isMobile }) => {
  const { mobile = isMobile } = useResponsive();
  const [activeTab, setActiveTab] = useQueryState('activeTab', {
    clearOnDefault: true,
    defaultValue: ProviderNavKey.Overview,
  });

  return (
    <Flexbox gap={24}>
      <Nav activeTab={activeTab as ProviderNavKey} mobile={mobile} setActiveTab={setActiveTab} />
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
          {activeTab === ProviderNavKey.Overview && <Overview />}
          {activeTab === ProviderNavKey.Guide && <Guide />}
          {activeTab === ProviderNavKey.Related && <Related />}
        </Flexbox>
        <Sidebar mobile={mobile} />
      </Flexbox>
    </Flexbox>
  );
});

export default Details;
