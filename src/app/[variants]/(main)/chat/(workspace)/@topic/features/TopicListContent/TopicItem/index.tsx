import { createStyles } from 'antd-style';
import { memo, useState } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useChatStore } from '@/store/chat';
import { threadSelectors } from '@/store/chat/selectors';
import { useGlobalStore } from '@/store/global';

import ThreadItem from '../ThreadItem';
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

    margin-block: 2px;
    margin-inline: 8px;
    padding: 8px;
    border-radius: ${token.borderRadius}px;

    &.topic-item {
      width: calc(100% - 16px);
    }

    &:hover {
      background: ${token.colorFillSecondary};
    }
  `,
  split: css`
    border-block-end: 1px solid ${token.colorSplit};
  `,
}));

export interface ConfigCellProps {
  active?: boolean;
  fav?: boolean;
  id?: string;
  threadId?: string;
  title: string;
}

const TopicItem = memo<ConfigCellProps>(({ title, active, id, fav, threadId }) => {
  const { styles, cx } = useStyles();
  const toggleConfig = useGlobalStore((s) => s.toggleMobileTopic);
  const [toggleTopic] = useChatStore((s) => [s.switchTopic]);
  const [isHover, setHovering] = useState(false);

  const threads = useChatStore(threadSelectors.getThreadsByTopic(id));

  return (
    <Flexbox style={{ position: 'relative' }}>
      <Flexbox
        align={'center'}
        className={cx(styles.container, 'topic-item', active && !threadId && styles.active)}
        distribution={'space-between'}
        horizontal
        onClick={() => {
          toggleTopic(id);
          toggleConfig(false);
        }}
        onMouseEnter={() => {
          setHovering(true);
        }}
        onMouseLeave={() => {
          setHovering(false);
        }}
      >
        {!id ? (
          <DefaultContent />
        ) : (
          <TopicContent fav={fav} id={id} showMore={isHover} title={title} />
        )}
      </Flexbox>
      {active &&
        threads?.map((item, index) => (
          <ThreadItem id={item.id} index={index} key={item.id} title={item.title} />
        ))}
    </Flexbox>
  );
});

export default TopicItem;
