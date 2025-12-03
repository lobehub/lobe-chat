'use client';

import { memo, useState } from 'react';
import { Flexbox } from 'react-layout-kit';

import ContextsList from './features/ContextsList';
import IdentitiesList from './features/IdentityTimeline';
import MemoryTabs, { MemoryCategory } from './features/MemoryTabs';

const Client = memo<{ mobile?: boolean }>(({ mobile }) => {
  const [activeCategory, setActiveCategory] = useState<MemoryCategory>('identities');

  const renderList = () => {
    switch (activeCategory) {
      case 'identities': {
        return <IdentitiesList mobile={mobile} />;
      }
      case 'contexts': {
        return <ContextsList mobile={mobile} />;
      }
      default: {
        return null;
      }
    }
  };

  return (
    <Flexbox gap={mobile ? 0 : 24}>
      <MemoryTabs onChange={setActiveCategory} value={activeCategory} />

      {renderList()}
    </Flexbox>
  );
});

export default Client;
