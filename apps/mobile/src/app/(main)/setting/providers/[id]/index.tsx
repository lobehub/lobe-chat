import { Empty, Flexbox, PageContainer, Text, useTheme } from '@lobehub/ui-rn';
import { FlashList } from '@shopify/flash-list';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator } from 'react-native';

import SectionHeader from '../features/SectionHeader';
import ConfigurationSection from './features/ConfigurationSection';
import ModelCard from './features/ModelCard';
import ModelsHeader from './features/ModelsHeader';
import ProviderInfoSection from './features/ProviderInfoSection';
import { useProviderDetail, useProviderModels } from './hooks';
import { useStyles } from './styles';
import { FlashListItem } from './types';

const ProviderDetailPage = () => {
  const navigation = useNavigation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { styles } = useStyles();
  const { t } = useTranslation(['setting']);
  const token = useTheme();

  // Provider 配置相关
  const { providerDetail, builtinProviderCard, isLoading, isConfigLoading, error } =
    useProviderDetail(id!);

  // 模型相关
  const {
    buildModelsData,
    handleFetchModels,
    handleToggleModel,
    handleEndReached,
    setSearchKeyword,
    isModelsLoading,
    displayedCount,
    totalFilteredCount,
  } = useProviderModels(id!);

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

  const headerTitle = builtinProviderCard?.name || providerDetail?.name || id || '';

  // 构建FlashList统一数据结构
  const flashListData = useMemo<FlashListItem[]>(() => {
    if (!providerDetail) return [];

    const items: FlashListItem[] = [];

    // 1. Provider信息section
    items.push(
      {
        data: providerDetail,
        id: 'provider-info',
        type: 'provider-info',
      },
      {
        data: providerDetail,
        id: 'configuration',
        type: 'configuration',
      },
    );

    // 3. Models数据（通过hook构建）
    return buildModelsData(items);
  }, [providerDetail, buildModelsData]);

  // 统一的renderItem函数
  const renderItem = useCallback(
    ({ item }: { item: FlashListItem }) => {
      switch (item.type) {
        case 'provider-info': {
          return <ProviderInfoSection provider={item.data} />;
        }

        case 'configuration': {
          return <ConfigurationSection provider={item.data} />;
        }

        case 'models-header': {
          return (
            <ModelsHeader
              isFetching={item.data.isFetching}
              onFetchModels={handleFetchModels}
              onSearchChange={setSearchKeyword}
              searchKeyword={item.data.searchKeyword}
              totalCount={item.data.totalCount}
            />
          );
        }

        case 'section-header': {
          return <SectionHeader count={item.data.count} title={item.data.title} />;
        }

        case 'model': {
          return <ModelCard model={item.data} onToggle={handleToggleModel} />;
        }

        case 'empty': {
          return <Empty description={item.data.message} />;
        }

        default: {
          return null;
        }
      }
    },
    [handleFetchModels, handleToggleModel, setSearchKeyword],
  );

  // FlashList的keyExtractor
  const keyExtractor = useCallback((item: FlashListItem) => item.id, []);

  // ListFooterComponent - 优雅的加载提示
  const renderFooter = useCallback(() => {
    if (isModelsLoading) {
      return (
        <Flexbox style={styles.footerLoading}>
          <ActivityIndicator color={token.colorPrimary} size="small" />
          <Text style={styles.footerText}>
            {t('aiProviders.models.loading', { ns: 'setting' })}
          </Text>
        </Flexbox>
      );
    }

    if (displayedCount < totalFilteredCount) {
      return (
        <Flexbox style={styles.footerLoading}>
          <ActivityIndicator color={token.colorTextSecondary} size="small" />
          <Text style={styles.footerText}>
            {t('aiProviders.models.loadingMore', { ns: 'setting' })} ({displayedCount}/
            {totalFilteredCount})
          </Text>
        </Flexbox>
      );
    }

    if (totalFilteredCount > 0) {
      return (
        <Flexbox style={styles.footerComplete}>
          <Text style={styles.footerCompleteText}>
            {t('aiProviders.models.allLoaded', { ns: 'setting' })} ({totalFilteredCount})
          </Text>
        </Flexbox>
      );
    }

    return null;
  }, [isModelsLoading, displayedCount, totalFilteredCount, token, t, styles]);

  let content;

  if (isLoading || isConfigLoading) {
    content = (
      <Flexbox style={styles.loadingContainer}>
        <Text style={styles.loadingText}>{t('aiProviders.detail.loading', { ns: 'setting' })}</Text>
      </Flexbox>
    );
  } else if (error || (!providerDetail && !isLoading && !isConfigLoading)) {
    content = (
      <Empty description={t('aiProviders.detail.loadFailed', { ns: 'setting' })} flex={1} />
    );
  } else if (!providerDetail) {
    content = <Empty description={t('aiProviders.list.loadFailed', { ns: 'setting' })} flex={1} />;
  } else {
    content = (
      <FlashList
        ListFooterComponent={renderFooter}
        contentContainerStyle={styles.scrollContainer}
        data={flashListData}
        drawDistance={500}
        getItemType={(item) => item.type}
        keyExtractor={keyExtractor}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.2}
        removeClippedSubviews={true}
        renderItem={renderItem}
        showsVerticalScrollIndicator={true}
      />
    );
  }

  return (
    <PageContainer showBack title={headerTitle}>
      {content}
    </PageContainer>
  );
};

export default ProviderDetailPage;
