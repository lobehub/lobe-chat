'use client';

import { ActionIcon } from '@lobehub/ui';
import { PlusIcon } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';
import { Virtuoso } from 'react-virtuoso';

import { RAGEvalDataSetItem } from '@/types/eval';

import Item from './Item';

interface DatasetListProps {
  dataSource: RAGEvalDataSetItem[];
}

const DatasetList = memo<DatasetListProps>(({ dataSource }) => {
  const { t } = useTranslation('ragEval');

  return (
    <Flexbox gap={24} height={'100%'}>
      <Flexbox align={'center'} horizontal justify={'space-between'}>
        <span>{t('dataset.list.title')}</span>
        <ActionIcon icon={PlusIcon} size={'small'} />
      </Flexbox>
      <Virtuoso data={dataSource} itemContent={(index, data) => <Item {...data} key={data.id} />} />
    </Flexbox>
  );
});

export default DatasetList;
