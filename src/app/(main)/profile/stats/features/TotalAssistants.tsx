import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import StatisticCard from '@/components/StatisticCard';
import { useClientDataSWR } from '@/libs/swr';
import { sessionService } from '@/services/session';

const TotalMessages = memo(() => {
  const { t } = useTranslation('auth');

  const { data, isLoading } = useClientDataSWR('count-sessions', sessionService.countSessions);

  return (
    <StatisticCard
      loading={isLoading}
      statistic={{
        precision: 0,
        value: data || '--',
      }}
      title={t('stats.assistants')}
    />
  );
});

export default TotalMessages;
