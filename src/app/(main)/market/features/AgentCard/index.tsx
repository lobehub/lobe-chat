import { Avatar, Tag } from '@lobehub/ui';
import { Typography } from 'antd';
import { createStyles } from 'antd-style';
import { startCase } from 'lodash-es';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useMarketStore } from '@/store/market';
import { AgentsMarketIndexItem } from '@/types/market';

import AgentCardBanner from './AgentCardBanner';

const { Paragraph } = Typography;

const useStyles = createStyles(({ css, token, responsive, isDarkMode }) => ({
  banner: css`
    opacity: ${isDarkMode ? 0.9 : 0.4};
  `,
  container: css`
    position: relative;
    overflow: hidden;
    border-radius: 11px;
    ${responsive.mobile} {
      border-radius: unset;
    }
  `,
  desc: css`
    color: ${token.colorTextDescription};
  `,
  inner: css`
    padding: 16px;
  `,
  title: css`
    margin-bottom: 0 !important;
    font-size: 16px;
    font-weight: 600;
  `,
}));

const AgentCard = memo<AgentsMarketIndexItem>(({ meta, identifier }) => {
  const { avatar, title, description, tags, backgroundColor } = meta;

  const onAgentCardClick = useMarketStore((s) => s.activateAgent);
  const { styles, theme } = useStyles();

  return (
    <Flexbox
      className={styles.container}
      key={identifier}
      onClick={() => onAgentCardClick(identifier)}
    >
      <AgentCardBanner className={styles.banner} meta={meta} />
      <Flexbox className={styles.inner} gap={8}>
        <Avatar
          alt={title}
          avatar={avatar}
          background={backgroundColor || theme.colorFillTertiary}
          size={56}
          title={title}
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

AgentCard.displayName = 'AgentCard';

export default AgentCard;
