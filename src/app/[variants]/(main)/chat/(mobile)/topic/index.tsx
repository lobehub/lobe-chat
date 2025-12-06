import dynamic from 'next/dynamic';
import { Flexbox } from 'react-layout-kit';

import TopicSearchBar from '@/app/[variants]/(main)/chat/_layout/Sidebar/Topic/TopicSearchBar';
import SkeletonList from '@/features/NavPanel/components/SkeletonList';

import TopicModal from './features/TopicModal';

const ConfigSwitcher = dynamic(
  () => import('@/app/[variants]/(main)/chat/(mobile)/topic/features/ConfigSwitcher'),
  {
    loading: () => <SkeletonList />,
  },
);

const Topic = () => {
  return (
    <TopicModal>
      <Flexbox gap={8} height={'100%'} padding={'8px 8px 0'} style={{ overflow: 'hidden' }}>
        <TopicSearchBar />
        <Flexbox
          height={'100%'}
          style={{ marginInline: -8, overflow: 'hidden', position: 'relative' }}
          width={'calc(100% + 16px)'}
        >
          <ConfigSwitcher />
          <Topic />
        </Flexbox>
      </Flexbox>
    </TopicModal>
  );
};

export default Topic;
