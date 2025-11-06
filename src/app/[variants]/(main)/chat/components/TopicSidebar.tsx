import dynamic from 'next/dynamic';
import { memo } from 'react';

import DesktopLayout from '../(workspace)/@topic/_layout/Desktop';
import MobileLayout from '../(workspace)/@topic/_layout/Mobile';
import SkeletonList from '../(workspace)/@topic/features/SkeletonList';
import Topic from '../(workspace)/@topic/features/Topic';

const ConfigSwitcher = dynamic(() => import('../(workspace)/@topic/features/ConfigSwitcher'), {
  loading: () => <SkeletonList />,
});

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
