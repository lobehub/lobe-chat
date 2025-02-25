import { Avatar as AntAvatar, Typography } from 'antd';
import { createStyles } from 'antd-style';
import { memo, useState } from 'react';
import { Flexbox } from 'react-layout-kit';

import { SearchResult } from '@/types/tool/search';

import { ENGINE_ICON_MAP } from '../../../const';
import TitleExtra from './TitleExtra';

const useStyles = createStyles(({ css, token }) => {
  return {
    container: css`
      display: flex;
      flex: 1;

      padding: 8px;
      border-radius: 8px;

      color: initial;

      &:hover {
        background: ${token.colorFillTertiary};
      }
    `,
    desc: css`
      overflow: hidden;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;

      color: ${token.colorTextTertiary};
      text-overflow: ellipsis;
    `,
    displayLink: css`
      color: ${token.colorTextQuaternary};
    `,
    iframe: css`
      border: 1px solid ${token.colorBorder};
      border-radius: 8px;
    `,
    title: css`
      overflow: hidden;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 1;

      font-size: 16px;
      color: ${token.colorLink};
      text-overflow: ellipsis;
    `,
    url: css`
      overflow: hidden;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 1;

      color: ${token.colorTextDescription};
      text-overflow: ellipsis;
    `,
  };
});

interface SearchResultProps extends SearchResult {
  highlight?: boolean;
}
const VideoItem = memo<SearchResultProps>(
  ({ content, url, iframe_src, highlight, score, engines, title, category }) => {
    const { styles, theme } = useStyles();

    const [expand, setExpand] = useState(false);
    return (
      <Flexbox gap={12}>
        <Flexbox className={styles.container} onClick={() => setExpand(!expand)}>
          <Flexbox flex={1} gap={8} horizontal padding={12}>
            {iframe_src && (
              <Flexbox>
                <iframe
                  // alt={title}
                  className={styles.iframe}
                  height={100}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onPlay={(e) => {
                    e.preventDefault();
                  }}
                  src={iframe_src}
                  style={{
                    pointerEvents: 'none',
                  }}
                  width={200}
                />
              </Flexbox>
            )}
            <Flexbox flex={1} gap={8}>
              <Flexbox align={'center'} distribution={'space-between'} gap={12} horizontal>
                <Flexbox align={'center'} gap={8} horizontal>
                  <AntAvatar.Group>
                    {engines.map((engine) => (
                      <AntAvatar
                        key={engine}
                        src={ENGINE_ICON_MAP[engine]}
                        style={{
                          background: theme.colorBgLayout,
                          height: 20,
                          padding: 3,
                          width: 20,
                        }}
                      />
                    ))}
                  </AntAvatar.Group>
                  <Flexbox className={styles.title}>{title}</Flexbox>
                </Flexbox>
                <TitleExtra
                  category={category}
                  engines={engines}
                  highlight={highlight}
                  score={score}
                />
              </Flexbox>
              <Typography.Text className={styles.url} type={'secondary'}>
                {url}
              </Typography.Text>
              <Flexbox className={styles.desc}>{content}</Flexbox>
            </Flexbox>
          </Flexbox>
        </Flexbox>
        {expand && iframe_src && (
          <Flexbox>
            <iframe className={styles.iframe} height={440} src={iframe_src} width={'100%'} />
          </Flexbox>
        )}
      </Flexbox>
    );
  },
);

export default VideoItem;
