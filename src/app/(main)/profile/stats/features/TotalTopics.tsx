import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import StatisticCard from '@/components/StatisticCard';
import { useClientDataSWR } from '@/libs/swr';
import { topicService } from '@/services/topic';

const TotalMessages = memo(() => {
  const { t } = useTranslation('auth');

  const { data, isLoading } = useClientDataSWR('count-topics', topicService.countTopics);

  return (
    <StatisticCard
      loading={isLoading}
      statistic={{
        precision: 0,
        value: data || '--',
      }}
      title={t('stats.topics')}
    />
  );
});

export default TotalMessages;
