import { Heatmaps } from '@lobehub/charts';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { useClientDataSWR } from '@/libs/swr';
import { messageService } from '@/services/message';

const AiHeatmaps = memo(() => {
  const { t } = useTranslation('auth');
  const { data, isLoading } = useClientDataSWR('stats-heatmaps', async () =>
    messageService.getHeatmaps(),
  );

  return (
    <Heatmaps
      blockSize={14}
      data={data || []}
      labels={{
        legend: {
          less: t('heatmaps.legend.less'),
          more: t('heatmaps.legend.more'),
        },
        months: [
          t('heatmaps.months.jan'),
          t('heatmaps.months.feb'),
          t('heatmaps.months.mar'),
          t('heatmaps.months.apr'),
          t('heatmaps.months.may'),
          t('heatmaps.months.jun'),
          t('heatmaps.months.jul'),
          t('heatmaps.months.aug'),
          t('heatmaps.months.sep'),
          t('heatmaps.months.oct'),
          t('heatmaps.months.nov'),
          t('heatmaps.months.dec'),
        ],
        tooltip: t('heatmaps.tooltip'),
        totalCount: t('heatmaps.totalCount'),
      }}
      loading={isLoading}
      maxLevel={4}
    />
  );
});

export default AiHeatmaps;
