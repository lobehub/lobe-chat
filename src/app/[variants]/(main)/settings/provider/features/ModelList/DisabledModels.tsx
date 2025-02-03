import { Icon } from '@lobehub/ui';
import { Button, Typography } from 'antd';
import isEqual from 'fast-deep-equal';
import { ChevronDown } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useAiInfraStore } from '@/store/aiInfra';
import { aiModelSelectors } from '@/store/aiInfra/selectors';

import ModelItem from './ModelItem';

const DisabledModels = memo(() => {
  const { t } = useTranslation('modelProvider');

  const [showMore, setShowMore] = useState(false);
  const disabledModels = useAiInfraStore(aiModelSelectors.disabledAiProviderModelList, isEqual);

  const displayModels = showMore ? disabledModels : disabledModels.slice(0, 10);

  return (
    disabledModels.length > 0 && (
      <Flexbox>
        <Typography.Text style={{ fontSize: 12, marginTop: 8 }} type={'secondary'}>
          {t('providerModels.list.disabled')}
        </Typography.Text>
        {displayModels.map((item) => (
          <ModelItem {...item} key={item.id} />
        ))}
        {!showMore && disabledModels.length > 10 && (
          <Button
            block
            color={'default'}
            icon={<Icon icon={ChevronDown} />}
            onClick={() => {
              setShowMore(true);
            }}
            size={'small'}
            variant={'filled'}
          >
            {t('providerModels.list.disabledActions.showMore')}
          </Button>
        )}
      </Flexbox>
    )
  );
});

export default DisabledModels;
