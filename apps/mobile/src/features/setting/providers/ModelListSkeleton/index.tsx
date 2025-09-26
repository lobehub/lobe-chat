import React from 'react';
import { Text, View } from 'react-native';

import { useTheme } from '@/theme';

import ModelCardSkeleton from '../ModelCardSkeleton';
import { useStyles } from './style';

const ModelListSkeleton: React.FC = () => {
  const { styles } = useStyles();
  const token = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionHeaderText, { color: token.colorTextSecondary }]}>Enabled</Text>
      </View>
      <ModelCardSkeleton />
      <ModelCardSkeleton />
      <ModelCardSkeleton />

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionHeaderText, { color: token.colorTextSecondary }]}>
          Disabled
        </Text>
      </View>
      <ModelCardSkeleton />
      <ModelCardSkeleton />
    </View>
  );
};

export default ModelListSkeleton;
