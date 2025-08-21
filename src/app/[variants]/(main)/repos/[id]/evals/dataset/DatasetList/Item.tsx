import { RAGEvalDataSetItem } from '@lobechat/types';
import { createStyles } from 'antd-style';
import { parseAsInteger, useQueryState } from 'nuqs';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

const useStyles = createStyles(({ css, token }) => ({
  active: css`
    background: ${token.colorFillTertiary};

    &:hover {
      background-color: ${token.colorFillSecondary};
    }
  `,
  container: css`
    cursor: pointer;

    margin-block-end: 2px;
    padding-block: 12px;
    padding-inline: 8px;
    border-radius: 8px;

    &:hover {
      background-color: ${token.colorFillTertiary};
    }
  `,
  icon: css`
    min-width: 24px;
    border-radius: 4px;
  `,
  title: css`
    text-align: start;
  `,
}));

const Item = memo<RAGEvalDataSetItem>(({ name, description, id }) => {
  const { styles, cx } = useStyles();

  const [activeDatasetId, activateDataset] = useQueryState('id', parseAsInteger);

  const isActive = activeDatasetId === id;
  return (
    <Flexbox
      className={cx(styles.container, isActive && styles.active)}
      onClick={() => {
        if (!isActive) {
          activateDataset(id);
        }
      }}
    >
      <div className={styles.title}>{name}</div>
      {description && <div>{description}</div>}
    </Flexbox>
  );
});

export default Item;
