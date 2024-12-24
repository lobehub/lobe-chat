import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import StatisticCard from '@/components/StatisticCard';
import { useClientDataSWR } from '@/libs/swr';
import { messageService } from '@/services/message';

const TotalMessages = memo(() => {
  const { t } = useTranslation('auth');

  const { data, isLoading } = useClientDataSWR('count-messages', messageService.countMessages);

  return (
    <StatisticCard
      loading={isLoading}
      statistic={{
        precision: 0,
        value: data || '--',
      }}
      title={t('stats.messages')}
    />
  );
});

export default TotalMessages;
