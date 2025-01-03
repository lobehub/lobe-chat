import { Typography } from 'antd';
import isEqual from 'fast-deep-equal';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useAiInfraStore } from '@/store/aiInfra';
import { aiModelSelectors } from '@/store/aiInfra/selectors';

import ModelItem from './ModelItem';

const DisabledModels = memo(() => {
  const { t } = useTranslation('modelProvider');

  const disabledModels = useAiInfraStore(aiModelSelectors.disabledAiProviderModelList, isEqual);

  return (
    <Flexbox>
      <Typography.Text style={{ fontSize: 12, marginTop: 8 }} type={'secondary'}>
        {t('providerModels.list.disabled')}
      </Typography.Text>
      {disabledModels.map((item) => (
        <ModelItem {...item} key={item.id} />
      ))}
    </Flexbox>
  );
});

export default DisabledModels;
