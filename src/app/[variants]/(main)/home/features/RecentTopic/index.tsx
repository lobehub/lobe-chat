import { BotMessageSquareIcon } from 'lucide-react';
import { Suspense, memo } from 'react';
import { useTranslation } from 'react-i18next';

import GroupBlock from '../components/GroupBlock';
import GroupSkeleton from '../components/GroupSkeleton';
import ScrollShadowWithButton from '../components/ScrollShadowWithButton';
import { RECENT_BLOCK_SIZE } from '../const';
import RecentTopicList from './List';

const RecentTopic = memo(() => {
  const { t } = useTranslation('chat');

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
