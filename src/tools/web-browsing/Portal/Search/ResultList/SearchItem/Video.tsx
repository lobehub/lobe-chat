import { UniformSearchResult } from '@lobechat/types';
import { Text } from '@lobehub/ui';
import { Avatar as AntAvatar } from 'antd';
import { createStyles } from 'antd-style';
import { memo, useState } from 'react';
import { Flexbox } from 'react-layout-kit';

import { ENGINE_ICON_MAP } from '../../../../const';
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

interface SearchResultProps extends UniformSearchResult {
  highlight?: boolean;
}
const VideoItem = memo<SearchResultProps>(
  ({ content, url, iframeSrc, highlight, score, engines, title, category, ...res }) => {
    const { styles, theme } = useStyles();

    const [expand, setExpand] = useState(false);

    const videoUrl = iframeSrc || (res as any).iframe_src; // iframe_src 是 SearchXNG 的字段，兼容老的数据结构
    return (
      <Flexbox gap={12}>
        <Flexbox className={styles.container} onClick={() => setExpand(!expand)}>
          <Flexbox flex={1} gap={8} horizontal padding={12}>
            {videoUrl && (
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
                  src={videoUrl}
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
              <Text className={styles.url} type={'secondary'}>
                {url}
              </Text>
              <Flexbox className={styles.desc}>{content}</Flexbox>
            </Flexbox>
          </Flexbox>
        </Flexbox>
        {expand && videoUrl && (
          <Flexbox>
            <iframe className={styles.iframe} height={440} src={videoUrl} width={'100%'} />
          </Flexbox>
        )}
      </Flexbox>
    );
  },
);

export default VideoItem;
