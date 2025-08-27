import React from 'react';
import { View, Text } from 'react-native';

import { useThemeToken } from '@/theme';
import ProviderCardSkeleton from '../ProviderCardSkeleton';

import { useStyles } from './style';

const ProviderListSkeleton: React.FC = () => {
  const { styles } = useStyles();
  const token = useThemeToken();

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: token.colorTextSecondary }]}>Enabled (-)</Text>
      </View>
      <ProviderCardSkeleton />
      <ProviderCardSkeleton />

      <View style={styles.sectionSeparator} />

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: token.colorTextSecondary }]}>Disabled (-)</Text>
      </View>
      <ProviderCardSkeleton />
      <ProviderCardSkeleton />
    </View>
  );
};

export default ProviderListSkeleton;
