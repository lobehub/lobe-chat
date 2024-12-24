import { BarList } from '@lobehub/charts';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

export const TopicsRank = memo(() => {
  const { t } = useTranslation('auth');
  return (
    <BarList
      data={[]}
      leftLabel={t('stats.topicsRank.left')}
      rightLabel={t('stats.topicsRank.right')}
    />
  );
});

export default TopicsRank;
