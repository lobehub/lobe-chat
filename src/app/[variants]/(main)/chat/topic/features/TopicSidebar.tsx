import dynamic from 'next/dynamic';
import { memo } from 'react';

import DesktopLayout from '@/app/[variants]/(main)/chat/topic/_layout/Desktop';
import MobileLayout from '@/app/[variants]/(main)/chat/topic/_layout/Mobile';
import SkeletonList from '@/app/[variants]/(main)/chat/topic/features/SkeletonList';
import Topic from '@/app/[variants]/(main)/chat/topic/features/Topic';

const ConfigSwitcher = dynamic(
  () => import('@/app/[variants]/(main)/chat/topic/features/ConfigSwitcher'),
  {
    loading: () => <SkeletonList />,
  },
);

interface TopicSidebarProps {
  mobile?: boolean;
}

const TopicSidebar = memo<TopicSidebarProps>(({ mobile }) => {
  const Layout = mobile ? MobileLayout : DesktopLayout;

  return (
    <Layout>
      <ConfigSwitcher />
      <Topic />
    </Layout>
  );
});

TopicSidebar.displayName = 'TopicSidebar';

export default TopicSidebar;
