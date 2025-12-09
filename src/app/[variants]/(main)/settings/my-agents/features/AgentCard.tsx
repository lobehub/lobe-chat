'use client';

import { Avatar, Block, Icon, Tag, Text, Tooltip } from '@lobehub/ui';
import { Tag as AntTag } from 'antd';
import { createStyles } from 'antd-style';
import { ClockIcon, CoinsIcon, DownloadIcon } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import PublishedTime from '@/components/PublishedTime';
import { AgentStatus, DiscoverAssistantItem } from '@/types/discover';
import { formatIntergerNumber } from '@/utils/format';

const getStatusTagColor = (status?: AgentStatus) => {
  switch (status) {
    case 'published': {
      return 'green';
    }
    case 'unpublished': {
      return 'orange';
    }
    case 'deprecated': {
      return 'red';
    }
    case 'archived': {
      return 'default';
    }
    default: {
      return 'default';
    }
  }
};

const useStyles = createStyles(({ css, token }) => {
  return {
    author: css`
      color: ${token.colorTextDescription};
    `,
    desc: css`
      flex: 1;
      margin: 0 !important;
      color: ${token.colorTextSecondary};
    `,
    footer: css`
      margin-block-start: 16px;
      border-block-start: 1px dashed ${token.colorBorder};
      background: ${token.colorBgContainerSecondary};
    `,
    secondaryDesc: css`
      font-size: 12px;
      color: ${token.colorTextDescription};
    `,
    statTag: css`
      border-radius: 4px;

      font-family: ${token.fontFamilyCode};
      font-size: 11px;
      color: ${token.colorTextSecondary};

      background: ${token.colorFillTertiary};
    `,
    title: css`
      margin: 0 !important;
      font-size: 16px !important;
      font-weight: 500 !important;

      &:hover {
        color: ${token.colorLink};
      }
    `,
  };
});

interface AgentCardProps extends DiscoverAssistantItem {
  onClick?: () => void;
}

const AgentCard = memo<AgentCardProps>(
  ({
    avatar,
    backgroundColor,
    title,
    description,
    author,
    createdAt,
    category,
    tokenUsage,
    installCount,
    status,
    onClick,
  }) => {
    const { styles } = useStyles();
    const { t } = useTranslation(['discover', 'setting']);

    return (
      <Block
        clickable
        height={'100%'}
        onClick={onClick}
        style={{
          cursor: 'pointer',
          overflow: 'hidden',
          position: 'relative',
        }}
        variant={'outlined'}
        width={'100%'}
      >
        <Flexbox
          align={'flex-start'}
          gap={16}
          horizontal
          justify={'space-between'}
          padding={16}
          width={'100%'}
        >
          <Flexbox
            gap={12}
            horizontal
            style={{
              overflow: 'hidden',
            }}
          >
            <Avatar
              avatar={avatar}
              background={backgroundColor || 'transparent'}
              size={40}
              style={{ flex: 'none' }}
            />
            <Flexbox
              flex={1}
              gap={2}
              style={{
                overflow: 'hidden',
              }}
            >
              <Flexbox align={'center'} gap={8} horizontal>
                <Text as={'h3'} className={styles.title} ellipsis style={{ flex: 1 }}>
                  {title}
                </Text>
                {status && (
                  <AntTag color={getStatusTagColor(status)} style={{ flexShrink: 0, margin: 0 }}>
                    {t(`setting:myAgents.status.${status}`)}
                  </AntTag>
                )}
              </Flexbox>
              {author && <div className={styles.author}>{author}</div>}
            </Flexbox>
          </Flexbox>
        </Flexbox>
        <Flexbox flex={1} gap={12} paddingInline={16}>
          <Text
            as={'p'}
            className={styles.desc}
            ellipsis={{
              rows: 3,
            }}
          >
            {description}
          </Text>
          <Flexbox align={'center'} gap={4} horizontal>
            <Tooltip
              placement={'top'}
              styles={{ root: { pointerEvents: 'none' } }}
              title={t('assistants.tokenUsage')}
            >
              <Tag className={styles.statTag} icon={<Icon icon={CoinsIcon} />}>
                {formatIntergerNumber(tokenUsage)}
              </Tag>
            </Tooltip>
            {installCount !== undefined && (
              <Tooltip
                placement={'top'}
                styles={{ root: { pointerEvents: 'none' } }}
                title={t('assistants.downloads')}
              >
                <Tag className={styles.statTag} icon={<Icon icon={DownloadIcon} />}>
                  {formatIntergerNumber(installCount)}
                </Tag>
              </Tooltip>
            )}
          </Flexbox>
        </Flexbox>
        <Flexbox
          align={'center'}
          className={styles.footer}
          horizontal
          justify={'space-between'}
          padding={16}
        >
          <Flexbox
            align={'center'}
            className={styles.secondaryDesc}
            horizontal
            justify={'space-between'}
          >
            <Flexbox align={'center'} gap={4} horizontal>
              <Icon icon={ClockIcon} size={14} />
              <PublishedTime
                className={styles.secondaryDesc}
                date={createdAt}
                template={'MMM DD, YYYY'}
              />
            </Flexbox>
            {category && t(`category.assistant.${category}` as any)}
          </Flexbox>
        </Flexbox>
      </Block>
    );
  },
);

export default AgentCard;
