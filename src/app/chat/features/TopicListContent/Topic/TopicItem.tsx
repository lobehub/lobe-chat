import { createStyles } from 'antd-style';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useChatStore } from '@/store/chat';
import { useGlobalStore } from '@/store/global';

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

    &:hover {
      background: ${token.colorFillSecondary};
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
  const toggleConfig = useGlobalStore((s) => s.toggleMobileTopic);
  const [toggleTopic] = useChatStore((s) => [s.switchTopic]);

  return (
    <Flexbox
      align={'center'}
      className={cx(styles.container, active && styles.active)}
      distribution={'space-between'}
      horizontal
      onClick={() => {
        toggleTopic(id);
        toggleConfig(false);
      }}
    >
      {!id ? <DefaultContent /> : <TopicContent fav={fav} id={id} title={title} />}
    </Flexbox>
  );
});

export default TopicItem;
