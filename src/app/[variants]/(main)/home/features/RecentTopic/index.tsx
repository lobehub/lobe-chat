import { ActionIcon } from '@lobehub/ui';
import { BotMessageSquareIcon, Loader2Icon } from 'lucide-react';
import { Suspense, memo } from 'react';
import { useTranslation } from 'react-i18next';

import { useInitRecentTopic } from '@/hooks/useInitRecentTopic';
import { useHomeStore } from '@/store/home';
import { homeRecentSelectors } from '@/store/home/selectors';

import GroupBlock from '../components/GroupBlock';
import GroupSkeleton from '../components/GroupSkeleton';
import ScrollShadowWithButton from '../components/ScrollShadowWithButton';
import { RECENT_BLOCK_SIZE } from '../const';
import RecentTopicList from './List';

const RecentTopic = memo(() => {
  const { t } = useTranslation('chat');
  const recentTopics = useHomeStore(homeRecentSelectors.recentTopics);
  const isInit = useHomeStore(homeRecentSelectors.isRecentTopicsInit);
  const { isRevalidating } = useInitRecentTopic();

  // After loaded, if no data, don't render
  if (isInit && (!recentTopics || recentTopics.length === 0)) {
    return null;
  }

  return (
    <GroupBlock
      action={isRevalidating && <ActionIcon icon={Loader2Icon} loading size={'small'} />}
      icon={BotMessageSquareIcon}
      title={t('topic.recent')}
    >
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
