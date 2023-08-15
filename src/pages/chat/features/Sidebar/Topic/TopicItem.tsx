import { createStyles } from 'antd-style';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useSessionStore } from '@/store/session';

import DefaultContent from './DefaultContent';
import TopicContent from './TopicContent';

const useStyles = createStyles(({ css, token, isDarkMode }) => ({
  active: css`
    background: ${isDarkMode ? token.colorFillSecondary : token.colorFillTertiary};
    transition: background 200ms ${token.motionEaseOut};

    &:hover {
      background: ${token.colorFill};
    }
  `,
  container: css`
    cursor: pointer;
    padding: 8px;
    border-radius: ${token.borderRadius}px;

    .topic-more {
      opacity: 0;
      transition: opacity 400ms ${token.motionEaseOut};
    }

    &:hover {
      background: ${token.colorFillSecondary};

      .topic-more {
        opacity: 1;
      }
    }
  `,
  split: css`
    border-bottom: 1px solid ${token.colorSplit};
  `,
}));

export interface ConfigCellProps {
  active?: boolean;
  fav?: boolean;
  id?: string;
  title: string;
}

const TopicItem = memo<ConfigCellProps>(({ title, active, id, fav }) => {
  const { styles, cx } = useStyles();

  const [toggleTopic] = useSessionStore((s) => [s.toggleTopic]);

  return (
    <Flexbox
      align={'center'}
      className={cx(styles.container, active && styles.active)}
      distribution={'space-between'}
      horizontal
      onClick={() => {
        toggleTopic(id);
      }}
    >
      {!id ? <DefaultContent /> : <TopicContent fav={fav} id={id} title={title} />}
    </Flexbox>
  );
});

export default TopicItem;
