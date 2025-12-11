'use client';

import { SiGithub, SiX } from '@icons-pack/react-simple-icons';
import { ActionIcon, Avatar, Text, Tooltip } from '@lobehub/ui';
import { Button } from 'antd';
import { useTheme } from 'antd-style';
import { Globe } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useUserDetailContext } from '../DetailProvider';
import Banner from './Banner';

const UserHeader = memo(() => {
  const { t } = useTranslation('discover');
  const theme = useTheme();
  const { user, isOwner, onEditProfile } = useUserDetailContext();

  const displayName = user.displayName || user.userName || user.namespace;
  const username = user.userName || user.namespace;

  return (
    <>
      <Banner avatar={user?.avatarUrl} />
      <Flexbox gap={16}>
        <Avatar
          avatar={user.avatarUrl || undefined}
          shape={'square'}
          size={64}
          style={{ boxShadow: `0 0 0 4px ${theme.colorBgContainer}`, flexShrink: 0 }}
        />
        <Flexbox align={'flex-start'} gap={16} horizontal justify={'space-between'}>
          <Flexbox
            gap={4}
            style={{
              overflow: 'hidden',
            }}
          >
            <Text as={'h1'} ellipsis fontSize={24} style={{ margin: 0 }} weight={'bold'}>
              {displayName}
            </Text>
            <Text ellipsis fontSize={12} type={'secondary'}>
              @{username}
            </Text>
          </Flexbox>
          {isOwner && onEditProfile && (
            <Button onClick={onEditProfile} shape={'round'}>
              {t('user.editProfile')}
            </Button>
          )}
        </Flexbox>

        {user.description && <Text as={'p'}>{user.description}</Text>}

        <Flexbox align={'center'} gap={8} horizontal>
          {user.socialLinks?.github && (
            <Tooltip title="GitHub">
              <a
                href={`https://github.com/${user?.socialLinks?.github}`}
                rel="noopener noreferrer"
                target="_blank"
              >
                <ActionIcon icon={<SiGithub size={16} />} size={20} variant={'outlined'} />
              </a>
            </Tooltip>
          )}
          {user.socialLinks?.twitter && (
            <Tooltip title="Twitter">
              <a
                href={`https://twitter.com/${user?.socialLinks?.twitter}`}
                rel="noopener noreferrer"
                target="_blank"
              >
                <ActionIcon icon={<SiX size={16} />} size={20} variant={'outlined'} />
              </a>
            </Tooltip>
          )}
          {user.socialLinks?.website && (
            <Tooltip title={t('user.website')}>
              <a href={user?.socialLinks?.website} rel="noopener noreferrer" target="_blank">
                <ActionIcon icon={Globe} size={20} variant={'outlined'} />
              </a>
            </Tooltip>
          )}
        </Flexbox>
      </Flexbox>
    </>
  );
});

export default UserHeader;
