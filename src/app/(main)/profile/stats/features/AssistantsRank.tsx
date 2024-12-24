import { BarList } from '@lobehub/charts';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

export const AssistantsRank = memo(() => {
  const { t } = useTranslation('auth');
  return (
    <BarList
      data={[]}
      leftLabel={t('stats.assistantsRank.left')}
      rightLabel={t('stats.assistantsRank.right')}
    />
  );
});

export default AssistantsRank;
