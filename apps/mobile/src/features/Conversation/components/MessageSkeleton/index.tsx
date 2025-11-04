import { Skeleton } from '@lobehub/ui-rn';
import type { FC } from 'react';
import { DimensionValue, View } from 'react-native';

import { useStyles } from './style';

interface MessageSkeletonProps {
  role: 'assistant' | 'user';
  width?: DimensionValue[];
}

const MessageSkeleton: FC<MessageSkeletonProps> = ({ role, width = ['100%', '100%', '75%'] }) => {
  const { styles } = useStyles();
  const isUser = role === 'user';

  return (
    <View style={[styles.container, isUser ? styles.userContainer : styles.assistantContainer]}>
      <View style={isUser ? styles.userBubble : styles.assistantBubble}>
        <Skeleton.Paragraph animated={true} rows={width.length} width={width} />
      </View>
    </View>
  );
};

export default MessageSkeleton;
