import { memo, useState } from 'react';
import { Flexbox } from 'react-layout-kit';

import { PluginNavKey } from '@/types/discover';

import Nav from './Nav';
import Overview from './Overview';

const InstallDetail = memo(() => {
  const [activeTab, setActiveTab] = useState(PluginNavKey.Overview);

  return (
    <Flexbox>
      <Nav activeTab={activeTab as PluginNavKey} inModal setActiveTab={setActiveTab} />

      <Flexbox gap={24}>{activeTab === PluginNavKey.Overview && <Overview />}</Flexbox>
    </Flexbox>
  );
});

export default InstallDetail;
