'use client';

import { ProviderIcon } from '@lobehub/icons';
import { Divider } from 'antd';
import { useTheme } from 'antd-style';
import { Brain } from 'lucide-react';
import Link from 'next/link';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import urlJoin from 'url-join';

import { DiscoverModelItem } from '@/types/discover';

import HighlightBlock from '../../../../features/HighlightBlock';
import ModelItem from './ModelItem';

interface ModelListProps {
  data: DiscoverModelItem[];
  identifier: string;
}

const ModelList = memo<ModelListProps>(({ data, identifier }) => {
  const { t } = useTranslation('discover');
  const theme = useTheme();

  return (
    <HighlightBlock
      avatar={<ProviderIcon provider={identifier} size={300} type={'avatar'} />}
      icon={Brain}
      justify={'space-between'}
      style={{ background: theme.colorBgContainer }}
      title={t('providers.supportedModels')}
    >
      {data.map((item, index) => (
        <>
          <Link href={urlJoin('/discover/model', item.identifier)} key={item.identifier}>
            <ModelItem {...item} />
          </Link>
          {index < data.length - 1 && <Divider key={index} style={{ margin: 0 }} />}
        </>
      ))}
    </HighlightBlock>
  );
});

export default ModelList;
