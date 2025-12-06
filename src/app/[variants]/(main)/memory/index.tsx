'use client';

import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';
import { useLoaderData } from 'react-router-dom';

import { MemoryType, MemoryTypeParams } from '@/app/[variants]/loaders/routeParams';

import ContextsList from './features/ContextsList';
import ExperiencesList from './features/ExperiencesList';
import IdentitiesList from './features/IdentityTimeline';
import MemoryTabs from './features/MemoryTabs';
import PreferencesList from './features/PreferencesList';

const Client = memo<{ mobile?: boolean }>(({ mobile }) => {
  const { type } = useLoaderData() as MemoryTypeParams;

  const activeCategory: MemoryType = type || 'identities';

  const renderList = () => {
    switch (activeCategory) {
      case 'identities': {
        return <IdentitiesList mobile={mobile} />;
      }
      case 'contexts': {
        return <ContextsList mobile={mobile} />;
      }
      case 'preferences': {
        return <PreferencesList mobile={mobile} />;
      }
      case 'experiences': {
        return <ExperiencesList mobile={mobile} />;
      }
      default: {
        return null;
      }
    }
  };

  return (
    <Flexbox gap={mobile ? 0 : 24}>
      <MemoryTabs value={activeCategory} />

      {renderList()}
    </Flexbox>
  );
});

export default Client;
