'use client';

import { ModelIcon } from '@lobehub/icons';
import { Divider } from 'antd';
import { useTheme } from 'antd-style';
import { BrainCircuit } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { DiscoverModelItem } from '@/types/discover';

import { useProviderList } from '../../../../../features/useProviderList';
import HighlightBlock from '../../../../features/HighlightBlock';
import ProviderItem from './ProviderItem';

interface ProviderListProps {
  data?: DiscoverModelItem;
  identifier: string;
}

const ProviderList = memo<ProviderListProps>(({ data, identifier }) => {
  const { t } = useTranslation('discover');
  const list = useProviderList(data?.providers);
  const theme = useTheme();

  return (
    <HighlightBlock
      avatar={<ModelIcon model={identifier} size={300} type={'avatar'} />}
      icon={BrainCircuit}
      justify={'space-between'}
      style={{ background: theme.colorBgContainer }}
      title={t('models.supportedProviders')}
    >
      {list.map((item, index) => (
        <>
          <ProviderItem
            id={item.id}
            // TODO: 配置模型价格
            // input={inputPrice}
            // output={outputPrice}
            key={item.id}
            maxOutput={data?.meta.maxOutput}
            title={item.title}
          />
          {index < list.length - 1 && <Divider key={index} style={{ margin: 0 }} />}
        </>
      ))}
    </HighlightBlock>
  );
});

export default ProviderList;
