'use client';

import { Button, Skeleton } from 'antd';
import { createStyles, useResponsive } from 'antd-style';
import { startCase } from 'lodash-es';
import { usePathname } from 'next/navigation';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useQueryRoute } from '@/hooks/useQueryRoute';

const useStyles = createStyles(({ css, token, isDarkMode }) => ({
  tag: css`
    background: ${isDarkMode ? token.colorBgContainer : token.colorFillTertiary};
    border: none;

    &:hover {
      background: ${isDarkMode ? token.colorBgElevated : token.colorFill} !important;
    }
  `,
}));

interface TagListProps {
  items: string[];
  loading?: boolean;
}

const TagList = memo<TagListProps>(({ loading, items = [] }) => {
  const { styles } = useStyles();
  const { md = true } = useResponsive();
  const pathname = usePathname();
  const router = useQueryRoute();

  if (loading || items?.length === 0) {
    return <Skeleton paragraph={{ rows: 4 }} style={{ marginBlock: 24 }} title={false} />;
  }

  const list = md ? items : items.slice(0, 20);

  return (
    <Flexbox gap={6} horizontal style={{ flexWrap: 'wrap' }}>
      {list.map((item) => {
        return (
          <Button
            className={styles.tag}
            key={item}
            onClick={() => {
              router.push(pathname.replace('/discover/', '/discover/search/'), {
                query: { q: item },
              });
            }}
            shape={'round'}
            size={'small'}
          >
            {startCase(item)}
          </Button>
        );
      })}
    </Flexbox>
  );
});

export default TagList;
