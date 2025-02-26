import { Typography } from 'antd';
import { createStyles } from 'antd-style';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import WebFavicon from '@/components/WebFavicon';
import { SearchResult } from '@/types/tool/search';

import TitleExtra from './TitleExtra';
import Video from './Video';

const useStyles = createStyles(({ css, token }) => {
  return {
    container: css`
      display: flex;
      flex: 1;

      padding: 8px;

      color: initial;

      border-radius: 8px;

      &:hover {
        background: ${token.colorFillTertiary};
      }
    `,
    desc: css`
      overflow: hidden;

      display: -webkit-box;
      -webkit-box-orient: vertical;

      color: ${token.colorTextTertiary};
      text-overflow: ellipsis;

      -webkit-line-clamp: 2;
    `,
    displayLink: css`
      color: ${token.colorTextQuaternary};
    `,
    title: css`
      font-size: 16px;
      color: ${token.colorLink};
    `,
    url: css`
      overflow: hidden;
     { /* stylelint-disable-line */ }
      display: -webkit-box;
      -webkit-box-orient: vertical;

      color: ${token.colorTextDescription};
      text-overflow: ellipsis;

      -webkit-line-clamp: 1;
    `,
  };
});

interface SearchResultProps extends SearchResult {
  highlight?: boolean;
}

const SearchItem = memo<SearchResultProps>((props) => {
  const { content, url, score, engines, title, category } = props;
  const { styles } = useStyles();

  if (category === 'videos') return <Video {...props} />;

  return (
    <a className={styles.container} href={url!} rel="noreferrer" target={'_blank'}>
      <Flexbox distribution={'space-between'} flex={1} gap={8} padding={12}>
        <Flexbox gap={8}>
          <Flexbox align={'center'} distribution={'space-between'} horizontal>
            <Flexbox align={'center'} gap={8} horizontal>
              <WebFavicon title={title} url={url} />
              <Flexbox className={styles.title}>{title}</Flexbox>
            </Flexbox>
            <TitleExtra
              category={category}
              engines={engines}
              highlight={props.highlight}
              score={score}
            />
          </Flexbox>
          <Typography.Text className={styles.url} type={'secondary'}>
            {url}
          </Typography.Text>
          <Flexbox className={styles.desc}>{content}</Flexbox>
        </Flexbox>
      </Flexbox>
    </a>
  );
});

export default SearchItem;
