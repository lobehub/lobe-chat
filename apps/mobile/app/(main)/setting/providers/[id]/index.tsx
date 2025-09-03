import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { aiProviderSelectors, useAiInfraStore } from '@/store/aiInfra';

import { useStyles } from './styles';
import ProviderInfoSection from './(components)/ProviderInfoSection';
import ModelsSection from './(components)/ModelsSection';
import ConfigurationSection from './(components)/ConfigurationSection';
import { Header } from '@/components';

const ProviderDetailPage = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { styles } = useStyles();
  const { t } = useTranslation(['setting']);

  // 获取provider详细信息
  const { useFetchAiProviderItem } = useAiInfraStore();
  const { data: providerDetail, isLoading, error } = useFetchAiProviderItem(id!);
  // 获取provider配置状态
  const isConfigLoading = useAiInfraStore(aiProviderSelectors.isAiProviderConfigLoading(id!));

  const headerTitle = providerDetail?.name || id || '';

  if (isLoading || isConfigLoading) {
    return (
      <SafeAreaView edges={['bottom']} style={styles.container}>
        <Header showBack title={headerTitle} />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>
            {t('aiProviders.detail.loading', { ns: 'setting' })}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView edges={['bottom']} style={styles.container}>
        <Header showBack title={headerTitle} />
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>
            {t('aiProviders.detail.loadFailed', { ns: 'setting' })}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <Header showBack title={headerTitle} />
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        style={styles.content}
      >
        {/* Provider基本信息 */}
        <ProviderInfoSection provider={providerDetail!} />

        <ConfigurationSection provider={providerDetail!} />

        {/* Model列表区域 */}
        <ModelsSection providerId={id!} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProviderDetailPage;
