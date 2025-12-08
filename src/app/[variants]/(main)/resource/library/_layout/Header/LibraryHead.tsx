'use client';

import { Text } from '@lobehub/ui';
import { Skeleton } from 'antd';
import { createStyles } from 'antd-style';
import { memo, useCallback } from 'react';
import { Center, Flexbox } from 'react-layout-kit';
import { useNavigate } from 'react-router-dom';

import { useResourceManagerStore } from '@/app/[variants]/(main)/resource/features/store';
import RepoIcon from '@/components/LibIcon';
import { knowledgeBaseSelectors, useKnowledgeBaseStore } from '@/store/knowledgeBase';

const useStyles = createStyles(({ css, token }) => ({
  clickableHeader: css`
    cursor: pointer;
    border-radius: ${token.borderRadius}px;
    transition: background-color 0.2s;

    &:hover {
      background-color: ${token.colorFillTertiary};
    }
  `,
}));

const Head = memo<{ id: string }>(({ id }) => {
  const { styles } = useStyles();
  const navigate = useNavigate();
  const name = useKnowledgeBaseStore(knowledgeBaseSelectors.getKnowledgeBaseNameById(id));
  const setMode = useResourceManagerStore((s) => s.setMode);

  const handleClick = useCallback(() => {
    navigate(`/resource/library/${id}`);
    setMode('explorer');
  }, [id, navigate, setMode]);

  return (
    <Flexbox
      align={'center'}
      className={styles.clickableHeader}
      gap={8}
      horizontal
      onClick={handleClick}
      paddingBlock={6}
      paddingInline={'10px 6px'}
    >
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
