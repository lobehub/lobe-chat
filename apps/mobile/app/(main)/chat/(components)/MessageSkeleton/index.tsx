import React from 'react';
import { View } from 'react-native';

import Skeleton from '@/components/Skeleton';

import { useStyles } from './style';

interface MessageSkeletonProps {
  role: 'assistant' | 'user';
}

const MessageSkeleton: React.FC<MessageSkeletonProps> = ({ role }) => {
  const { styles } = useStyles();
  const isUser = role === 'user';

  return (
    <View style={[styles.container, isUser ? styles.userContainer : styles.assistantContainer]}>
      <View style={isUser ? styles.userBubble : styles.assistantBubble}>
        <Skeleton.Paragraph animated={true} rows={1} width="100%" />
      </View>
    </View>
  );
};

export default MessageSkeleton;
