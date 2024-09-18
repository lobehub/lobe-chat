import { createStyles } from 'antd-style';
import { memo, useState } from 'react';
import { Flexbox } from 'react-layout-kit';

import { ExampleTopic } from '@/types/discover';

const useStyles = createStyles(({ css, token }) => ({
  active: css`
    background: ${token.colorBgElevated};
    border-inline-start: 4px solid ${token.colorFill};
    box-shadow: 0 0 0 1px ${token.colorFillSecondary} inset;
  `,
  container: css`
    overflow: auto hidden;
  `,
  desc: css`
    line-height: 1.2;
    color: ${token.colorTextDescription};
  `,
  item: css`
    cursor: pointer;

    background: ${token.colorFillTertiary};
    border-inline-start: 4px solid transparent;
    border-radius: ${token.borderRadiusLG}px;

    transition: all 0.2s ${token.motionEaseInOut};

    &:hover {
      background: ${token.colorBgElevated};
      border-inline-start: 4px solid ${token.colorFill};
      box-shadow: 0 0 0 1px ${token.colorFillSecondary} inset;
    }
  `,
  title: css`
    font-weight: 500;
    line-height: 1.2;
  `,
}));

interface TopicListProps {
  data: ExampleTopic[];
  onChoose?: (id: string) => void;
}

const TopicList = memo<TopicListProps>(({ data, onChoose }) => {
  const { cx, styles } = useStyles();
  const [active, setActive] = useState(data[0].id);

  return (
    <Flexbox className={styles.container} gap={8} horizontal padding={8}>
      {data.map((topic) => {
        const isActive = active === topic.id;
        return (
          <Flexbox
            className={cx(styles.item, isActive && styles.active)}
            gap={4}
            key={topic.id}
            onClick={() => {
              setActive(topic.id);
              onChoose?.(topic.id);
            }}
            padding={12}
          >
            <div className={styles.title}>{topic.title}</div>
            <div className={styles.desc}>{topic.description}</div>
          </Flexbox>
        );
      })}
    </Flexbox>
  );
});

export default TopicList;
