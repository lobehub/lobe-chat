import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

import { useTheme } from '@/components/theme';

import ProviderCardSkeleton from '../ProviderCardSkeleton';
import { useStyles } from './style';

const ProviderListSkeleton: FC = () => {
  const { styles } = useStyles();
  const token = useTheme();
  const { t } = useTranslation(['setting']);

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: token.colorTextSecondary }]}>
          {t('aiProviders.skeleton.enabled', { ns: 'setting' })} (-)
        </Text>
      </View>
      <ProviderCardSkeleton />
      <ProviderCardSkeleton />

      <View style={styles.sectionSeparator} />

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: token.colorTextSecondary }]}>
          {t('aiProviders.skeleton.disabled', { ns: 'setting' })} (-)
        </Text>
      </View>
      <ProviderCardSkeleton />
      <ProviderCardSkeleton />
    </View>
  );
};

export default ProviderListSkeleton;
