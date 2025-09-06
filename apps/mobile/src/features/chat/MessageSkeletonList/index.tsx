import React from 'react';
import { View } from 'react-native';

import MessageSkeleton from '../MessageSkeleton';
import { useStyles } from './style';

const MessageSkeletonList: React.FC = () => {
  const { styles } = useStyles();

  return (
    <View style={styles.container}>
      <MessageSkeleton role="assistant" />
      <MessageSkeleton role="user" />
      <MessageSkeleton role="assistant" />
      <MessageSkeleton role="user" />
    </View>
  );
};

export default MessageSkeletonList;
