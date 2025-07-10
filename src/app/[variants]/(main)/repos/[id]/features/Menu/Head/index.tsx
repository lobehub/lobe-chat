'use client';

import { Text } from '@lobehub/ui';
import { memo } from 'react';
import { Center, Flexbox } from 'react-layout-kit';

import GoBack from '@/components/GoBack';
import RepoIcon from '@/components/RepoIcon';
import { knowledgeBaseSelectors, useKnowledgeBaseStore } from '@/store/knowledgeBase';

const Head = memo(() => {
  const name = useKnowledgeBaseStore(knowledgeBaseSelectors.activeKnowledgeBaseName);

  return (
    <Flexbox gap={8}>
      <GoBack href={'/files'} />
      <Flexbox align={'center'} gap={8} height={36} horizontal>
        <Center style={{ minWidth: 24 }} width={24}>
          <RepoIcon />
        </Center>

        <Text ellipsis strong style={{ fontSize: 16 }}>
          {name}
        </Text>
      </Flexbox>
    </Flexbox>
  );
});
export default Head;
