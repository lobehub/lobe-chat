import { Avatar, Tag } from '@lobehub/ui';
import { useHover } from 'ahooks';
import { Typography } from 'antd';
import { useThemeMode } from 'antd-style';
import { startCase } from 'lodash-es';
import { memo, useRef } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useMarketStore } from '@/store/market';
import { AgentsMarketIndexItem } from '@/types/market';

import AgentCardBanner from './AgentCardBanner';
import { useStyles } from './style';

const { Paragraph } = Typography;

const AgentCardItem = memo<AgentsMarketIndexItem>(({ meta, identifier }) => {
  const ref = useRef(null);
  const isHovering = useHover(ref);
  const onAgentCardClick = useMarketStore((s) => s.activateAgent);
  const { styles, theme } = useStyles();
  const { isDarkMode } = useThemeMode();

  const { avatar, title, description, tags, backgroundColor } = meta;

  return (
    <Flexbox className={styles.container} onClick={() => onAgentCardClick(identifier)}>
      <AgentCardBanner meta={meta} style={{ opacity: isDarkMode ? 0.9 : 0.4 }} />
      <Flexbox className={styles.inner} gap={8} ref={ref}>
        <Avatar
          animation={isHovering}
          avatar={avatar}
          background={backgroundColor || theme.colorFillTertiary}
          size={56}
        />
        <Paragraph className={styles.title} ellipsis={{ rows: 1, tooltip: title }}>
          {title}
        </Paragraph>
        <Paragraph className={styles.desc} ellipsis={{ rows: 2, tooltip: description }}>
          {description}
        </Paragraph>
        <Flexbox gap={6} horizontal style={{ flexWrap: 'wrap' }}>
          {(tags as string[]).filter(Boolean).map((tag: string, index) => (
            <Tag key={index} style={{ margin: 0 }}>
              {startCase(tag).trim()}
            </Tag>
          ))}
        </Flexbox>
      </Flexbox>
    </Flexbox>
  );
});

export default AgentCardItem;
