import { useLocalSearchParams, useNavigation } from 'expo-router';
import React, { useEffect, useMemo } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DEFAULT_MODEL_PROVIDER_LIST } from '@/config/modelProviders';
import { aiProviderSelectors, useAiInfraStore } from '@/store/aiInfra';
import { AiProviderDetailItem } from '@/types/aiProvider';

import { useStyles } from './styles';
import ProviderInfoSection from './(components)/ProviderInfoSection';
import ModelsSection from './(components)/ModelsSection';
import ConfigurationSection from './(components)/ConfigurationSection';
import { Header } from '@/components';

const ProviderDetailPage = () => {
  const navigation = useNavigation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { styles } = useStyles();
  const { t } = useTranslation(['setting']);

  // 先从本地配置获取基础信息
  const builtinProviderCard = useMemo(
    () => DEFAULT_MODEL_PROVIDER_LIST.find((v) => v.id === id),
    [id],
  );

  // 获取用户的provider配置
  const { useFetchAiProviderItem } = useAiInfraStore();
  const { data: userConfig, isLoading, error } = useFetchAiProviderItem(id!);

  // 获取provider配置状态
  const isConfigLoading = useAiInfraStore(aiProviderSelectors.isAiProviderConfigLoading(id!));

  // 合并配置
  const providerDetail = useMemo<AiProviderDetailItem | undefined>(() => {
    if (!builtinProviderCard && !userConfig) return undefined;

    // 如果是内置provider，合并本地配置和用户配置
    if (builtinProviderCard) {
      return {
        ...builtinProviderCard,
        ...userConfig,

        // 保留用户配置的这些字段
        enabled: userConfig?.enabled ?? builtinProviderCard.enabled,

        keyVaults: userConfig?.keyVaults || {},
        // 确保settings字段来自本地配置
        settings: builtinProviderCard.settings,
      } as AiProviderDetailItem;
    }

    // 如果是自定义provider，直接使用用户配置
    return userConfig;
  }, [builtinProviderCard, userConfig]);

  // 动态设置页面标题
  useEffect(() => {
    const displayName = providerDetail?.name || builtinProviderCard?.name || id;
    if (displayName) {
      navigation.setOptions({
        headerTitle: displayName,
        title: displayName,
      });
    }
  }, [navigation, providerDetail?.name, builtinProviderCard?.name, id]);
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

  if (error || (!providerDetail && !isLoading && !isConfigLoading)) {
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

  if (!providerDetail) {
    return null;
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
