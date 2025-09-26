import { Avatar, GitHubAvatar } from '@lobehub/ui-rn';
import dayjs from 'dayjs';
import React from 'react';
import { Text, View } from 'react-native';

import { AVATAR_SIZE_LARGE } from '@/_const/common';

import { useStyles } from './styles';

interface DetailHeaderProps {
  author: string;
  avatar: string;
  createdAt: string;
  title?: string;
}

const DetailHeader: React.FC<DetailHeaderProps> = ({ avatar, title, author, createdAt }) => {
  const { styles, theme } = useStyles();

  return (
    <View style={styles.headerContainer}>
      <Avatar
        alt={title}
        avatar={avatar || '🤖'}
        backgroundColor={theme.colorBgContainer}
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
