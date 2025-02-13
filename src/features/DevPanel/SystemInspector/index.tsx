'use client';

import { TabsNav } from '@lobehub/ui';
import { useState } from 'react';
import { Flexbox } from 'react-layout-kit';

import AiProviderRuntimeConfig from './AiProviderRuntimeConfig';
import ServerConfig from './ServerConfig';

enum TabKey {
  AiProviderRuntimeConfig = 'aiProviderRuntimeConfig',
  ServerConfig = 'serverConfig',
}

const SystemInspector = () => {
  const [activeTab, setActiveTab] = useState<TabKey>(TabKey.ServerConfig);

  return (
    <Flexbox gap={4} height={'100%'}>
      <TabsNav
        activeKey={activeTab}
        items={[
          {
            key: TabKey.ServerConfig,
            label: 'Server Config',
          },
          {
            key: TabKey.AiProviderRuntimeConfig,
            label: 'Ai Provider Runtime Config',
          },
        ]}
        onChange={(activeTab) => setActiveTab(activeTab as TabKey)}
        variant={'compact'}
      />

      {activeTab === TabKey.ServerConfig && <ServerConfig />}
      {activeTab === TabKey.AiProviderRuntimeConfig && <AiProviderRuntimeConfig />}
    </Flexbox>
  );
};

export default SystemInspector;
