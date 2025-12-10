'use client';

import { Github } from '@lobehub/icons';
import { ActionIcon, Avatar, Text, Tooltip } from '@lobehub/ui';
import { Button } from 'antd';
import { createStyles } from 'antd-style';
import { Globe, Package, Settings, Twitter } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import PublishedTime from '@/components/PublishedTime';
import { DiscoverUserInfo } from '@/types/discover';

const useStyles = createStyles(({ css, token }) => ({
  bio: css`
    color: ${token.colorTextSecondary};
  `,
  displayName: css`
    margin: 0;
    font-size: 24px;
    font-weight: 600;
  `,
  stat: css`
    font-size: 14px;
    color: ${token.colorTextSecondary};
  `,
  statLabel: css`
    font-size: 12px;
    color: ${token.colorTextDescription};
  `,
  statNumber: css`
    font-size: 18px;
    font-weight: 600;
    color: ${token.colorText};
  `,
  username: css`
    font-size: 14px;
    color: ${token.colorTextDescription};
  `,
}));

interface UserHeaderProps {
  agentCount: number;
  isOwner?: boolean;
  mobile?: boolean;
  onEditProfile?: () => void;
  totalInstalls: number;
  user: DiscoverUserInfo;
}

const UserHeader = memo<UserHeaderProps>(({ user, agentCount, mobile, isOwner, onEditProfile }) => {
  const { t } = useTranslation('discover');
  const { styles, theme } = useStyles();

  const displayName = user.displayName || user.userName || user.namespace;
  const username = user.userName || user.namespace;

  return (
    <Flexbox gap={16}>
      <Flexbox align={'flex-start'} gap={16} horizontal={!mobile} width={'100%'}>
        <Avatar
          avatar={user.avatarUrl || undefined}
          size={mobile ? 64 : 80}
          style={{ flexShrink: 0 }}
        />
        <Flexbox flex={1} gap={8}>
          <Flexbox align="center" gap={12} horizontal justify="space-between">
            <Flexbox gap={4}>
              <Text as={'h1'} className={styles.displayName}>
                {displayName}
              </Text>
              <Text className={styles.username}>@{username}</Text>
            </Flexbox>
            {isOwner && onEditProfile && (
              <Button icon={<Settings size={16} />} onClick={onEditProfile}>
                {t('user.editProfile')}
              </Button>
            )}
          </Flexbox>

          {user.description && (
            <Text className={styles.bio} ellipsis={{ rows: 2 }}>
              {user.description}
            </Text>
          )}

          <Flexbox align={'center'} gap={16} horizontal style={{ marginTop: 8 }}>
            <Flexbox align={'center'} gap={4} horizontal>
              <Package size={16} style={{ color: theme.colorTextDescription }} />
              <span className={styles.statNumber}>{agentCount}</span>
              <span className={styles.statLabel}>{t('user.agents')}</span>
            </Flexbox>
          </Flexbox>

          <Flexbox align={'center'} gap={8} horizontal style={{ marginTop: 8 }}>
            {user.socialLinks?.github && (
              <Tooltip title="GitHub">
                <a
                  href={`https://github.com/${user.socialLinks.github}`}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <ActionIcon icon={Github} size={'small'} />
                </a>
              </Tooltip>
            )}
            {user.socialLinks?.twitter && (
              <Tooltip title="Twitter">
                <a
                  href={`https://twitter.com/${user.socialLinks.twitter}`}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <ActionIcon icon={Twitter} size={'small'} />
                </a>
              </Tooltip>
            )}
            {user.socialLinks?.website && (
              <Tooltip title={t('user.website')}>
                <a href={user.socialLinks.website} rel="noopener noreferrer" target="_blank">
                  <ActionIcon icon={Globe} size={'small'} />
                </a>
              </Tooltip>
            )}
            <PublishedTime
              date={user.createdAt}
              style={{ color: theme.colorTextDescription, fontSize: 12 }}
              template={'MMM YYYY'}
            />
          </Flexbox>
        </Flexbox>
      </Flexbox>
    </Flexbox>
  );
});

export default UserHeader;
