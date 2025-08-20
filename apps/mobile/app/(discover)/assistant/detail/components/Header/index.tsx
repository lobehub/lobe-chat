import React from 'react';
import { Text, View } from 'react-native';
import dayjs from 'dayjs';

import { Avatar } from '@/components';
import GitHubAvatar from '@/components/GithubAvatar';
import { useStyles } from './styles';
import { AVATAR_SIZE_LARGE } from '@/const/common';

interface DetailHeaderProps {
  author: string;
  avatar: string;
  createdAt: string;
  title?: string;
}

const DetailHeader: React.FC<DetailHeaderProps> = ({ avatar, title, author, createdAt }) => {
  const { styles, token } = useStyles();

  return (
    <View style={styles.headerContainer}>
      <Avatar
        alt={title}
        avatar={avatar || '🤖'}
        backgroundColor={token.colorBgContainer}
        size={AVATAR_SIZE_LARGE}
      />
      <View style={styles.headerContent}>
        <Text style={styles.name}>{title || ''}</Text>
        <View style={styles.authorContainer}>
          <GitHubAvatar size={20} username={author || 'LobeChat'} />
          <Text style={styles.authorName}>{author || 'LobeChat'}</Text>
          <Text style={styles.date}>{dayjs(createdAt).format('YYYY-MM-DD')}</Text>
        </View>
      </View>
    </View>
  );
};

export default DetailHeader;
