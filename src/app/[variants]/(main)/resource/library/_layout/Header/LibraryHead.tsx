'use client';

import { useDroppable } from '@dnd-kit/core';
import { Text , Skeleton } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { memo, useCallback } from 'react';
import { Center, Flexbox } from 'react-layout-kit';
import { useNavigate } from 'react-router-dom';

import { useDragActive } from '@/app/[variants]/(main)/resource/features/DndContextWrapper';
import { useResourceManagerStore } from '@/app/[variants]/(main)/resource/features/store';
import RepoIcon from '@/components/LibIcon';
import { knowledgeBaseSelectors, useKnowledgeBaseStore } from '@/store/knowledgeBase';

const useStyles = createStyles(({ css, token }) => ({
  clickableHeader: css`
    cursor: pointer;
    border-radius: ${token.borderRadius}px;
    transition: all 0.2s;

    &:hover {
      background-color: ${token.colorFillTertiary};
    }
  `,
  dropZoneActive: css`
    color: ${token.colorBgElevated} !important;
    background-color: ${token.colorText} !important;

    * {
      color: ${token.colorBgElevated} !important;
    }
  `,
}));

const Head = memo<{ id: string }>(({ id }) => {
  const { styles, cx } = useStyles();
  const navigate = useNavigate();
  const name = useKnowledgeBaseStore(knowledgeBaseSelectors.getKnowledgeBaseNameById(id));
  const setMode = useResourceManagerStore((s) => s.setMode);
  const isDragActive = useDragActive();

  // Special droppable ID for root folder - matches the pattern expected by DndContextWrapper
  const ROOT_DROP_ID = `__root__:${id}`;

  const { setNodeRef, isOver } = useDroppable({
    data: {
      fileType: 'custom/folder',
      isFolder: true,
      name: 'Root',
      targetId: null,
    },
    disabled: !isDragActive,
    id: ROOT_DROP_ID,
  });

  const handleClick = useCallback(() => {
    navigate(`/resource/library/${id}`);
    setMode('explorer');
  }, [id, navigate, setMode]);

  return (
    <Flexbox
      align={'center'}
      className={cx(styles.clickableHeader, isOver && styles.dropZoneActive)}
      gap={8}
      horizontal
      onClick={handleClick}
      paddingBlock={6}
      paddingInline={'10px 6px'}
      ref={setNodeRef}
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
