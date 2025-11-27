import { Tag } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { memo, useMemo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { SemanticSearchChunk } from '@/types/chunk';

const useStyles = createStyles(({ css, token }) => ({
  container: css`
    padding-block: 12px;
    padding-inline: 8px;
    border-block-end: 1px solid ${token.colorBorderSecondary};
    border-radius: 4px;

    &:hover {
      background: ${token.colorFillTertiary};
    }
  `,
  pageNumber: css`
    font-size: 12px;
    color: ${token.colorTextDescription};
  `,
  text: css`
    font-size: 14px;
    line-height: 24px;
  `,
  title: css`
    font-size: 18px;
  `,
}));

interface ChunkItemProps extends Omit<SemanticSearchChunk, 'index'> {
  index: number;
}

const SearchItem = memo<ChunkItemProps>(({ text, pageNumber, type, similarity }) => {
  const { styles, cx } = useStyles();

  const typeClassName = useMemo(() => {
    switch (type) {
      default: {
        return styles.text;
      }
      case 'Title': {
        return styles.title;
      }
    }
  }, [type]);

  return (
    <Flexbox className={cx(styles.container, typeClassName)} gap={8}>
      {text}

      <Flexbox align={'center'} distribution={'space-between'} horizontal>
        <Tag bordered={false}>{similarity.toFixed(2)}</Tag>
        <Flexbox className={styles.pageNumber}>第 {pageNumber} 页</Flexbox>
      </Flexbox>
    </Flexbox>
  );
});

export default SearchItem;
