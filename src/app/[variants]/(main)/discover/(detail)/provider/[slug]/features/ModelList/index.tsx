'use client';

import { ProviderIcon } from '@lobehub/icons';
import { Icon } from '@lobehub/ui';
import { Button, Divider } from 'antd';
import { useTheme } from 'antd-style';
import { Brain, ChevronsUpDown } from 'lucide-react';
import { Fragment, memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { DiscoverModelItem } from '@/types/discover';

import HighlightBlock from '../../../../features/HighlightBlock';
import ModelItem from './ModelItem';

const DEFAULT_LENGTH = 4;

interface ModelListProps {
  identifier: string;
  mobile?: boolean;
  modelData: DiscoverModelItem[];
}

const ModelList = memo<ModelListProps>(({ mobile, modelData, identifier }) => {
  const [showAll, setShowAll] = useState(false);
  const { t } = useTranslation('discover');
  const theme = useTheme();

  const list = showAll ? modelData : modelData.slice(0, DEFAULT_LENGTH);

  return (
    <HighlightBlock
      avatar={<ProviderIcon provider={identifier} size={300} type={'avatar'} />}
      icon={Brain}
      justify={'space-between'}
      style={{ background: theme.colorBgContainer }}
      title={t('providers.supportedModels')}
    >
      {list.map((item, index) => (
        <Fragment key={item.identifier}>
          <ModelItem mobile={mobile} {...item} />
          {index < modelData.length - 1 && <Divider style={{ margin: 0 }} />}
        </Fragment>
      ))}
      {modelData.length > DEFAULT_LENGTH && !showAll && (
        <Flexbox padding={16}>
          <Button icon={<Icon icon={ChevronsUpDown} />} onClick={() => setShowAll(true)}>
            {t('providers.showAllModels')}{' '}
            <span style={{ color: theme.colorTextDescription }}>
              (+{modelData.length - DEFAULT_LENGTH})
            </span>
          </Button>
        </Flexbox>
      )}
    </HighlightBlock>
  );
});

export default ModelList;
