'use client';

import { Tag } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import Link from 'next/link';
import qs from 'query-string';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

const useStyles = createStyles(({ token, css }) => {
  return {
    tag: css`
      margin: 0;
      padding-block: 4px;
      padding-inline: 12px;
      border-radius: 16px;

      color: ${token.colorTextSecondary};
    `,
  };
});

const TagList = memo<{ tags: string[] }>(({ tags }) => {
  const { styles } = useStyles();
  const showTags = Boolean(tags?.length && tags?.length > 0);
  return (
    showTags && (
      <Flexbox gap={8} horizontal wrap={'wrap'}>
        {tags.map((tag) => (
          <Link
            href={qs.stringifyUrl({
              query: {
                q: tag,
              },
              url: '/discover/assistant',
            })}
            key={tag}
          >
            <Tag className={styles.tag}>{tag}</Tag>
          </Link>
        ))}
      </Flexbox>
    )
  );
});

export default TagList;
