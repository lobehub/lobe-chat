import React from 'react';
import { View } from 'react-native';

import Skeleton from '@/components/Skeleton';

import { useStyles } from './style';

const ProviderCardSkeleton: React.FC = () => {
  const { styles } = useStyles();

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Skeleton.Avatar animated={true} size={24} />
          <View
            style={{
              flex: 1,
            }}
          >
            <Skeleton.Paragraph animated={true} rows={1} width="80%" />
          </View>
        </View>
        <View style={styles.description}>
          <Skeleton.Paragraph animated={true} rows={2} width={['90%', '60%']} />
        </View>
      </View>
    </View>
  );
};

export default ProviderCardSkeleton;
