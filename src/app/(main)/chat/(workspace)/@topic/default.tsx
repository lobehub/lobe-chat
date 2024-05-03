import { isMobileDevice } from '@/utils/responsive';

import SystemRole from './features/SystemRole';
import TopicListContent from './features/TopicListContent';

const Topic = () => {
  const mobile = isMobileDevice();

  return (
    <>
      {!mobile && <SystemRole />}
      <TopicListContent mobile={mobile} />
    </>
  );
};

Topic.displayName = 'ChatTopic';

export default Topic;
