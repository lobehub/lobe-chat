import { isMobileDevice } from '@/utils/responsive';

import Desktop from './_layout/Desktop';
import Mobile from './_layout/Mobile';
import SystemRole from './features/SystemRole';
import TopicListContent from './features/TopicListContent';

const Topic = () => {
  const mobile = isMobileDevice();

  const Layout = mobile ? Mobile : Desktop;

  return (
    <>
      {!mobile && <SystemRole />}
      <Layout>
        <TopicListContent />
      </Layout>
    </>
  );
};

Topic.displayName = 'ChatTopic';

export default Topic;
