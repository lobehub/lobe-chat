'use client';

import { Grid } from '@lobehub/ui';
import { Skeleton } from 'antd';
import { createStyles } from 'antd-style';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

const useStyles = createStyles(({ css, token, isDarkMode }) => ({
  container: css`
    cursor: pointer;

    position: relative;

    overflow: hidden;

    background: ${token.colorBgContainer};
    border-radius: ${token.borderRadiusLG}px;
    box-shadow: 0 0 1px 1px ${isDarkMode ? token.colorFillQuaternary : token.colorFillSecondary}
      inset;

    transition: box-shadow 0.2s ${token.motionEaseInOut};
  `,
  desc: css`
    min-height: 44px;
    margin-block-end: 0 !important;
    color: ${token.colorTextDescription};
  `,

  time: css`
    color: ${token.colorTextDescription};
  `,
  title: css`
    margin-block-end: 0 !important;
    font-weight: bold;
  `,
}));

const Card = memo<{ banner?: boolean }>(({ banner }) => {
  const { styles } = useStyles();
  return (
    <Flexbox className={styles.container}>
      {banner && (
        <Flexbox width={'100%'}>
          <Skeleton.Button style={{ height: 64, width: '100%' }} />
        </Flexbox>
      )}
      <Flexbox padding={16}>
        <Skeleton active />
      </Flexbox>
    </Flexbox>
  );
});

interface GridLoadingCardProps {
  banner?: boolean;
  count?: number;
  rows?: number;
}

const GridLoadingCard = memo<GridLoadingCardProps>(({ count = 8, rows = 4, banner }) => (
  <Grid maxItemWidth={280} rows={rows}>
    {Array.from({ length: count }).map((_, index) => (
      <Card banner={banner} key={index} />
    ))}
  </Grid>
));

export default GridLoadingCard;
