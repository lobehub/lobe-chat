'use client';

import { Text } from '@lobehub/ui';
import { Skeleton } from 'antd';
import { memo } from 'react';
import { Center, Flexbox } from 'react-layout-kit';

import RepoIcon from '@/components/RepoIcon';
import { knowledgeBaseSelectors, useKnowledgeBaseStore } from '@/store/knowledgeBase';

const Head = memo<{ id: string }>(({ id }) => {
  const name = useKnowledgeBaseStore(knowledgeBaseSelectors.getKnowledgeBaseNameById(id));

  return (
    <Flexbox align={'center'} gap={8} horizontal padding={6}>
      <Center style={{ minWidth: 24 }} width={24}>
        <RepoIcon />
      </Center>
      {!name ? (
        <Skeleton active paragraph={false} title={{ style: { marginBottom: 0 }, width: 80 }} />
      ) : (
        <Text ellipsis strong style={{ fontSize: 16 }}>
          {name}
        </Text>
      )}
    </Flexbox>
  );
});

Head.displayName = 'Head';

export default Head;
