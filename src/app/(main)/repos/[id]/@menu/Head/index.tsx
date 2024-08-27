'use client';

import { Skeleton, Typography } from 'antd';
import { memo } from 'react';
import { Center, Flexbox } from 'react-layout-kit';

import GoBack from '@/components/GoBack';
import RepoIcon from '@/components/RepoIcon';

import { useKnowledgeBaseItem } from '../../hooks/useKnowledgeItem';

const Head = memo<{ id: string }>(({ id }) => {
  const { data, isLoading } = useKnowledgeBaseItem(id);

  return (
    <Flexbox gap={8}>
      <GoBack href={'/files'} />
      <Flexbox align={'center'} gap={8} height={36} horizontal>
        <Center style={{ minWidth: 24 }} width={24}>
          <RepoIcon />
        </Center>
        {isLoading ? (
          <Skeleton active paragraph={{ rows: 1, style: { marginBottom: 0 } }} title={false} />
        ) : (
          <Typography.Text style={{ fontSize: 16, fontWeight: 'bold' }}>
            {data?.name}
          </Typography.Text>
        )}
      </Flexbox>
    </Flexbox>
  );
});
export default Head;
