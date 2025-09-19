import React from 'react';
import { View } from 'react-native';

import MessageSkeleton from '../MessageSkeleton';
import { useStyles } from './style';

const MessageSkeletonList: React.FC = () => {
  const { styles } = useStyles();

  return (
    <View style={styles.container}>
      <MessageSkeleton role="user" />
      <MessageSkeleton role="assistant" width={['100%', '100%', '100%', '80%']} />
      <MessageSkeleton role="user" />
      <MessageSkeleton role="assistant" width={['100%', '100%', '100%', '100%', '100%', '50%']} />
    </View>
  );
};

export default MessageSkeletonList;
