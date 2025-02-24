import { Typography } from 'antd';
import { createStyles } from 'antd-style';
import Image from 'next/image';
import Link from 'next/link';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { SearchResult } from '@/types/tool/search';

const useStyles = createStyles(({ css, token }) => ({
  container: css`
    cursor: pointer;

    height: 100%;
    padding: 8px;
    border-radius: 8px;

    font-size: 12px;
    color: initial;

    background: ${token.colorFillQuaternary};

    &:hover {
      background: ${token.colorFillTertiary};
    }
  `,
  title: css`
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;

    text-overflow: ellipsis;
  `,
  url: css`
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;

    text-overflow: ellipsis;
  `,
}));

const SearchResultItem = memo<SearchResult>(({ url, title }) => {
  const { styles } = useStyles();

  const urlObj = new URL(url);
  const host = urlObj.hostname;
  return (
    <Link href={url} target={'_blank'}>
      <Flexbox className={styles.container} gap={2} justify={'space-between'} key={url}>
        <div className={styles.title}>{title}</div>
        <Flexbox align={'center'} gap={4} horizontal>
          <Image
            alt={title || url}
            height={14}
            src={`https://icons.duckduckgo.com/ip3/${host}.ico`}
            style={{ borderRadius: 4 }}
            unoptimized
            width={14}
          />
          <Typography.Text className={styles.url} type={'secondary'}>
            {host.replace('www.', '')}
          </Typography.Text>
        </Flexbox>
      </Flexbox>
    </Link>
  );
});

export default SearchResultItem;
