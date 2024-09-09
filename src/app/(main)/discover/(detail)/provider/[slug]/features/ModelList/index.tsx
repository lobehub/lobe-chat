'use client';

import { ProviderIcon } from '@lobehub/icons';
import { Button, Divider } from 'antd';
import { useTheme } from 'antd-style';
import { Brain } from 'lucide-react';
import Link from 'next/link';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';
import urlJoin from 'url-join';

import { DiscoverModelItem } from '@/types/discover';

import HighlightBlock from '../../../../features/HighlightBlock';
import ModelItem from './ModelItem';

const DEFAULT_LENGTH = 4;

interface ModelListProps {
  data: DiscoverModelItem[];
  identifier: string;
}

const ModelList = memo<ModelListProps>(({ data, identifier }) => {
  const [showAll, setShowAll] = useState(false);
  const { t } = useTranslation('discover');
  const theme = useTheme();

  const list = showAll ? data : data.slice(0, DEFAULT_LENGTH);

  return (
    <HighlightBlock
      avatar={<ProviderIcon provider={identifier} size={300} type={'avatar'} />}
      icon={Brain}
      justify={'space-between'}
      style={{ background: theme.colorBgContainer }}
      title={t('providers.supportedModels')}
    >
      {list.map((item, index) => (
        <>
          <Link href={urlJoin('/discover/model', item.identifier)} key={item.identifier}>
            <ModelItem {...item} />
          </Link>
          {index < data.length - 1 && <Divider key={index} style={{ margin: 0 }} />}
        </>
      ))}
      {data.length > DEFAULT_LENGTH && !showAll && (
        <Flexbox padding={16}>
          <Button onClick={() => setShowAll(true)}>{t('providers.showAllModels')}</Button>
        </Flexbox>
      )}
    </HighlightBlock>
  );
});

export default ModelList;
