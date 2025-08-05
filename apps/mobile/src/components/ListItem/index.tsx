import { Href, Link } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { useStyles } from './style';
import { Avatar } from '..';

interface ListItemProps {
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

const ListItem = ({ title, avatar, description, extra, onPress, href }: ListItemProps) => {
  const { styles } = useStyles(!!description);

  const content = (
    <View style={styles.sessionItem}>
      {avatar && <Avatar avatar={avatar} size={48} />}
      <View style={styles.info}>
        <Text numberOfLines={1} style={styles.title}>
          {title}
        </Text>
        {description && (
          <Text numberOfLines={1} style={styles.description}>
            {description}
          </Text>
        )}
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
