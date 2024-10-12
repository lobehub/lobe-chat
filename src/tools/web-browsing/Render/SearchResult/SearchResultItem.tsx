import { Typography } from 'antd';
import { createStyles } from 'antd-style';
import Link from 'next/link';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { SearchResult } from '@/types/tool/search';

import { EngineAvatar } from '../../components/EngineAvatar';

const useStyles = createStyles(({ css, token }) => ({
  container: css`
    cursor: pointer;

    height: 100%;
    padding: 8px;

    font-size: 12px;
    color: initial;

    background: ${token.colorFillQuaternary};
    border-radius: 8px;

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

const SearchResultItem = memo<SearchResult>(({ url, title, engine }) => {
  const { styles } = useStyles();

  return (
    <Link href={url} target={'_blank'}>
      <Flexbox className={styles.container} gap={2} justify={'space-between'} key={url}>
        <div className={styles.title}>{title}</div>
        <Flexbox align={'center'} gap={4} horizontal>
          <EngineAvatar engine={engine} />
          <Typography.Text className={styles.url} type={'secondary'}>
            {new URL(url).hostname.replace('www.', '')}
          </Typography.Text>
        </Flexbox>
      </Flexbox>
    </Link>
  );
});

export default SearchResultItem;
