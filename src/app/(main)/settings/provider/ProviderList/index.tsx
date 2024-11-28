'use client';

import { createStyles } from 'antd-style';
import { memo } from 'react';

import { DEFAULT_MODEL_PROVIDER_LIST } from '@/config/modelProviders';

import Card from './Card';

const useStyles = createStyles(({ css, responsive }) => ({
  container: css`
    display: grid;
    grid-gap: 12px;
    grid-template-columns: repeat(2, 1fr);

    width: 100%;
    padding: 16px;
    ${responsive.mobile} {
      display: flex;
      flex-direction: column;
    }
  `,
}));

const List = memo(() => {
  const { styles } = useStyles();
  return (
    <div className={styles.container}>
      {DEFAULT_MODEL_PROVIDER_LIST.map((item) => (
        <Card {...item} key={item.id} />
      ))}
    </div>
  );
});

export default List;
