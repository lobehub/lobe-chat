import { StarFilled, StarOutlined } from '@ant-design/icons';
import { ActionIcon } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { LucideIcon } from 'lucide-react';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';
import { shallow } from 'zustand/shallow';

import { useSessionStore } from '@/store/session';

const useStyles = createStyles(({ css, token }) => ({
  active: css`
    background: ${token.colorFill};

    &:hover {
      background: ${token.colorFill};
    }
  `,
  container: css`
    cursor: pointer;
    background: ${token.colorFillTertiary};
    border-radius: 6px;

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
  showFav?: boolean;
  title: string;
}

const TopicItem = memo<ConfigCellProps>(({ title, active, id, showFav, fav }) => {
  const { styles, theme, cx } = useStyles();

  const [dispatchTopic, toggleTopic] = useSessionStore(
    (s) => [s.dispatchTopic, s.toggleTopic],
    shallow,
  );
  const starIcon = (fav ? StarFilled : StarOutlined) as LucideIcon;

  return (
    <Flexbox
      align={'center'}
      className={cx(styles.container, active && styles.active)}
      distribution={'space-between'}
      horizontal
      onClick={() => {
        toggleTopic(id);
      }}
      padding={'10px 12px'}
    >
      {title}
      {!showFav ? undefined : (
        <ActionIcon
          icon={starIcon}
          onClick={() => {
            if (!id) return;

            dispatchTopic({ id, key: 'favorite', type: 'updateChatTopic', value: !fav });
          }}
          size={'small'}
          style={{
            color: fav ? theme.yellow : undefined,
          }}
        />
      )}
    </Flexbox>
  );
});

export default TopicItem;
