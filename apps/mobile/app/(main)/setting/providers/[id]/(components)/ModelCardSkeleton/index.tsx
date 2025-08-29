import React from 'react';
import { View } from 'react-native';

import Skeleton from '@/components/Skeleton';

import { useStyles } from './style';

const ModelCardSkeleton: React.FC = () => {
  const { styles } = useStyles();

  return (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <Skeleton.Avatar animated={true} size={32} />
        <View style={styles.modelInfo}>
          <View style={styles.bottomRow}>
            <Skeleton.Paragraph animated={true} rows={2} width="40%" />
          </View>
        </View>
        <View style={styles.switchContainer}>
          <Skeleton.Avatar animated={true} size={20} />
        </View>
      </View>
    </View>
  );
};

export default ModelCardSkeleton;
