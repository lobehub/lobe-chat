'use client';

import { Typography } from 'antd';
import { memo } from 'react';
import { Center, Flexbox } from 'react-layout-kit';

import GoBack from '@/components/GoBack';
import RepoIcon from '@/components/RepoIcon';

const Head = memo<{ name?: string }>(({ name }) => {
  return (
    <Flexbox gap={8}>
      <GoBack href={'/files'} />
      <Flexbox align={'center'} gap={8} height={36} horizontal>
        <Center style={{ minWidth: 24 }} width={24}>
          <RepoIcon />
        </Center>

        <Typography.Text style={{ fontSize: 16, fontWeight: 'bold' }}>{name}</Typography.Text>
      </Flexbox>
    </Flexbox>
  );
});
export default Head;
