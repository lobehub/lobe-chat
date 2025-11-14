import { createStyles } from 'antd-style';
import { memo, useMemo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useFileStore } from '@/store/file';
import { FileChunk } from '@/types/chunk';

const useStyles = createStyles(({ css, token }) => ({
  container: css`
    padding-block: 12px;
    padding-inline: 8px;
    border-block-end: 1px dashed ${token.colorBorderSecondary};
    border-radius: 4px;

    &:hover {
      background: ${token.colorFillTertiary};
    }
  `,
  text: css`
    font-size: 14px;
    line-height: 24px;
  `,
  title: css`
    font-size: 18px;
  `,
}));

type ChunkItemProps = FileChunk;

const ChunkItem = memo<ChunkItemProps>(({ text, type, id }) => {
  const { styles, cx } = useStyles();

  const highlightChunks = useFileStore((s) => s.highlightChunks);

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
    <Flexbox
      className={cx(styles.container, typeClassName)}
      onMouseEnter={() => {
        highlightChunks([id]);
      }}
      onMouseLeave={() => {
        highlightChunks([]);
      }}
    >
      {text}
    </Flexbox>
  );
});

export default ChunkItem;
