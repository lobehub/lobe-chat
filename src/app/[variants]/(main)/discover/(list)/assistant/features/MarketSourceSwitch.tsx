'use client';

import { Select } from 'antd';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useQuery } from '@/hooks/useQuery';
import { useQueryRoute } from '@/hooks/useQueryRoute';
import { AssistantMarketSource } from '@/types/discover';

const MarketSourceSwitch = memo(() => {
  const { t } = useTranslation('discover');
  const router = useQueryRoute();
  const query = useQuery() as { source?: AssistantMarketSource };
  const currentSource = (query.source as AssistantMarketSource) ?? 'new';

  const options = useMemo(
    () => [
      {
        label: t('assistants.marketSource.new'),
        value: 'new',
      },
      {
        label: t('assistants.marketSource.legacy'),
        value: 'legacy',
      },
    ],
    [t],
  );

  const handleChange = (value: AssistantMarketSource) => {
    router.push('/discover/assistant', {
      query: {
        page: null,
        source: value === 'new' ? null : value,
      },
    });
  };

  return (
    <Flexbox align={'center'} gap={8} horizontal>
      <span>{t('assistants.marketSource.label')}</span>
      <Select
        options={options}
        size={'small'}
        style={{ minWidth: 132 }}
        value={currentSource}
        onChange={handleChange}
      />
    </Flexbox>
  );
});

MarketSourceSwitch.displayName = 'MarketSourceSwitch';

export default MarketSourceSwitch;
