import { Avatar, Tag } from '@lobehub/ui';
import { Typography } from 'antd';
import { createStyles } from 'antd-style';
import { startCase } from 'lodash-es';
import Link from 'next/link';
import { memo } from 'react';
import { Center, Flexbox } from 'react-layout-kit';

import { useMarketStore } from '@/store/market';
import { AgentsMarketIndexItem } from '@/types/market';

import AgentCardBanner from './AgentCardBanner';

const { Paragraph, Title } = Typography;

const useStyles = createStyles(({ css, token, isDarkMode }) => ({
  banner: css`
    opacity: ${isDarkMode ? 0.9 : 0.4};
  `,
  container: css`
    cursor: pointer;

    position: relative;

    overflow: hidden;

    height: 100%;

    background: ${token.colorBgContainer};
    border-radius: ${token.borderRadiusLG}px;
    box-shadow: 0 0 1px 1px ${isDarkMode ? token.colorFillQuaternary : token.colorFillSecondary}
      inset;

    transition: box-shadow 0.2s ${token.motionEaseInOut};

    &:hover {
      box-shadow: 0 0 1px 1px ${isDarkMode ? token.colorFillSecondary : token.colorFill} inset;
    }
  `,
  desc: css`
    min-height: 44px;
    margin-bottom: 0 !important;
    color: ${token.colorTextDescription};
  `,
  inner: css`
    padding: 16px;
  `,
  time: css`
    color: ${token.colorTextDescription};
  `,
  title: css`
    margin-bottom: 0 !important;
    font-size: 18px !important;
    font-weight: bold;
  `,
}));

interface AgentCardProps extends AgentsMarketIndexItem {
  variant?: 'default' | 'compact';
}

const AgentCard = memo<AgentCardProps>(
  ({ meta, createAt, author, homepage, identifier, variant }) => {
    const { avatar, title, description, tags } = meta;

    const onAgentCardClick = useMarketStore((s) => s.activateAgent);
    const { styles, theme } = useStyles();
    const isCompact = variant === 'compact';

    return (
      <Flexbox
        className={styles.container}
        gap={24}
        key={identifier}
        onClick={() => onAgentCardClick(identifier)}
      >
        {!isCompact && <AgentCardBanner avatar={avatar} />}
        <Flexbox className={styles.inner} gap={12}>
          <Flexbox align={'flex-end'} gap={16} horizontal justify={'space-between'} width={'100%'}>
            <Title className={styles.title} ellipsis={{ rows: 1, tooltip: title }} level={3}>
              {title}
            </Title>
            {isCompact ? (
              <Avatar
                alt={title}
                avatar={avatar}
                size={40}
                style={{ alignSelf: 'flex-end' }}
                title={title}
              />
            ) : (
              <Center
                flex={'none'}
                height={64}
                style={{
                  background: theme.colorBgContainer,
                  borderRadius: '50%',
                  marginTop: -6,
                  overflow: 'hidden',
                  zIndex: 2,
                }}
                width={64}
              >
                <Avatar alt={title} avatar={avatar} size={56} title={title} />
              </Center>
            )}
          </Flexbox>
          {!isCompact && (
            <Flexbox gap={12} horizontal style={{ fontSize: 12 }}>
              <Link aria-label={author} href={homepage} target={'_blank'}>
                @{author}
              </Link>
              <time className={styles.time} dateTime={new Date(createAt).toISOString()}>
                {createAt}
              </time>
            </Flexbox>
          )}
          <Paragraph className={styles.desc} ellipsis={{ rows: 2 }}>
            {description}
          </Paragraph>
          <Flexbox gap={6} horizontal style={{ flexWrap: 'wrap' }}>
            {(tags as string[])
              .slice(0, 4)
              .filter(Boolean)
              .map((tag: string, index) => (
                <Tag key={index} style={{ margin: 0 }}>
                  {startCase(tag).trim()}
                </Tag>
              ))}
          </Flexbox>
        </Flexbox>
      </Flexbox>
    );
  },
);

AgentCard.displayName = 'AgentCard';

export default AgentCard;
