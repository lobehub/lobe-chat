import { useResponsive } from 'antd-style';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import AgentCard, { type AgentCardProps } from './AgentCard';
import { useStyles } from './style';

const items: AgentCardProps['meta'][] = [
  {
    avatar: '😀',
    description: 'dddddd',
    title: 'Title',
  },
  {
    avatar: '😀',
    description: 'dddddd',
    title: 'Title',
  },
  {
    avatar: '😀',
    description: 'dddddd',
    title: 'Title',
  },
];

const AgentTemplate = memo<{ width: number }>(({ width }) => {
  const { styles } = useStyles();
  const { mobile } = useResponsive();
  return (
    <Flexbox
      className={styles.templateContainer}
      gap={16}
      horizontal={!mobile}
      style={{ marginTop: -width / 20 }}
    >
      {items.map((meta, index) => (
        <AgentCard key={index} meta={meta} />
      ))}
    </Flexbox>
  );
});

export default AgentTemplate;
