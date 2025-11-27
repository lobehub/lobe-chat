import { BotMessageSquareIcon } from 'lucide-react';
import { Suspense, memo } from 'react';
import { useTranslation } from 'react-i18next';

import { useSessionStore } from '@/store/session';
import { recentSelectors } from '@/store/session/selectors';

import GroupBlock from '../components/GroupBlock';
import GroupSkeleton from '../components/GroupSkeleton';
import ScrollShadowWithButton from '../components/ScrollShadowWithButton';
import { RECENT_BLOCK_SIZE } from '../const';
import RecentTopicList from './List';

const RecentTopic = memo(() => {
  const { t } = useTranslation('chat');
  const recentTopics = useSessionStore(recentSelectors.recentTopics);
  const isInit = useSessionStore(recentSelectors.isRecentTopicsInit);

  // After loaded, if no data, don't render
  if (isInit && (!recentTopics || recentTopics.length === 0)) {
    return null;
  }

  return (
    <GroupBlock icon={BotMessageSquareIcon} title={t('topic.recent')}>
      <ScrollShadowWithButton>
        <Suspense
          fallback={
            <GroupSkeleton
              height={RECENT_BLOCK_SIZE.TOPIC.HEIGHT}
              width={RECENT_BLOCK_SIZE.TOPIC.WIDTH}
            />
          }
        >
          <RecentTopicList />
        </Suspense>
      </ScrollShadowWithButton>
    </GroupBlock>
  );
});

export default RecentTopic;
