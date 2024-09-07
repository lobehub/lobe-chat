'use client';

import { createStyles } from 'antd-style';
import { Flexbox } from 'react-layout-kit';

import CircleLoading from '@/components/CircleLoading';
import { useKnowledgeBaseStore } from '@/store/knowledgeBase';

import { PageProps } from '../type';
import DatasetDetail from './DatasetDetail';
import DatasetList from './DatasetList';
import EmptyGuide from './EmptyGuide';

const useStyles = createStyles(({ css, token }) => ({
  sider: css`
    padding-inline-end: 12px;
    border-inline-end: 1px solid ${token.colorSplit};
  `,
}));

const Dataset = ({ params }: PageProps) => {
  const { styles } = useStyles();
  const knowledgeBaseId = params.id;

  const useFetchDatasets = useKnowledgeBaseStore((s) => s.useFetchDatasets);

  const { data, isLoading } = useFetchDatasets(knowledgeBaseId);

  const isEmpty = data?.length === 0;

  return isLoading ? (
    <CircleLoading />
  ) : isEmpty ? (
    <EmptyGuide knowledgeBaseId={knowledgeBaseId} />
  ) : (
    <Flexbox height={'100%'} horizontal>
      <Flexbox className={styles.sider} width={200}>
        <DatasetList dataSource={data!} />
      </Flexbox>
      <Flexbox width={'100%'}>
        <DatasetDetail />
      </Flexbox>
    </Flexbox>
  );
};

export default Dataset;
