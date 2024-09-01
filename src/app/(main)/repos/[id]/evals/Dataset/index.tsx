'use client';

import { createStyles } from 'antd-style';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import CircleLoading from '@/components/CircleLoading';
import { useKnowledgeBaseStore } from '@/store/knowledgeBase';

import DatasetDetail from './DatasetDetail';
import DatasetList from './DatasetList';
import EmptyGuide from './EmptyGuide';

const useStyles = createStyles(({ css, token }) => ({
  container: css`
    padding: 16px;
    background: ${token.colorBgContainer};
    border-radius: 8px;
  `,
}));

interface DatasetProps {
  knowledgeBaseId: string;
}

const Dataset = memo<DatasetProps>(({ knowledgeBaseId }) => {
  const { styles } = useStyles();
  const useFetchDatasets = useKnowledgeBaseStore((s) => s.useFetchDatasets);
  const { data, isLoading } = useFetchDatasets(knowledgeBaseId);

  const isEmpty = data?.length === 0;

  return isLoading ? (
    <CircleLoading />
  ) : isEmpty ? (
    <EmptyGuide knowledgeBaseId={knowledgeBaseId} />
  ) : (
    <Flexbox className={styles.container} gap={32} height={'100%'} horizontal>
      <Flexbox width={240}>
        <DatasetList dataSource={data!} />
      </Flexbox>
      <Flexbox width={'100%'}>
        <DatasetDetail />
      </Flexbox>
    </Flexbox>
  );
});
export default Dataset;
