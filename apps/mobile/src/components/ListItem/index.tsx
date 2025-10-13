import { Href, Link } from 'expo-router';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';

import { AVATAR_SIZE_MEDIUM } from '@/_const/common';

import Avatar from '../Avatar';
import Text from '../Text';
import { useStyles } from './style';

interface ListItemProps {
  active?: boolean;
  avatar?: string | React.ReactNode;
  description?: string;
  extra?: React.ReactNode;
  href?: Href;
  /**
   * 类似 onClick，必须要透传，否则上层无法响应点击事件
   */
  onPress?: () => void;
  title: string;
}

const ListItem = ({ title, avatar, description, extra, onPress, href, active }: ListItemProps) => {
  const { styles } = useStyles(!!description, active);

  const content = (
    <View style={styles.listItem}>
      {avatar && <Avatar avatar={avatar} size={AVATAR_SIZE_MEDIUM} />}
      <View style={styles.info}>
        <Text ellipsis style={styles.title}>
          {title}
        </Text>
        <Text ellipsis style={styles.description}>
          {description}
        </Text>
      </View>
      {extra && <Text style={styles.extra}>{extra}</Text>}
    </View>
  );

  if (href) {
    return (
      <Link asChild href={href}>
        <TouchableOpacity onPress={onPress}>{content}</TouchableOpacity>
      </Link>
    );
  }

  return <TouchableOpacity onPress={onPress}>{content}</TouchableOpacity>;
};

export default ListItem;
