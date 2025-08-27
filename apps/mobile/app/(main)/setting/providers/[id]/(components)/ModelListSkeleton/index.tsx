import React from 'react';
import { View, Text } from 'react-native';

import { useThemeToken } from '@/theme';
import ModelCardSkeleton from '../ModelCardSkeleton';

import { useStyles } from './style';

const ModelListSkeleton: React.FC = () => {
  const { styles } = useStyles();
  const token = useThemeToken();

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
