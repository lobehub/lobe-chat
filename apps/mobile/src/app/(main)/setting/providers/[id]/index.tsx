import {
  Center,
  Empty,
  Flexbox,
  PageContainer,
  Segmented,
  TabView,
  Text,
  useTheme,
} from '@lobehub/ui-rn';
import { FlashList } from '@shopify/flash-list';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { BrainIcon, LucideSettings2 } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useState } from 'react';
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

enum Tabs {
  Configuration = 'configuration',
  Models = 'models',
}

const ProviderDetailPage = () => {
  const [tab, setTab] = useState<Tabs>(Tabs.Configuration);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { styles } = useStyles();
  const { t } = useTranslation('setting');
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

  // Configuration 标签页数据
  const configurationData = useMemo<FlashListItem[]>(() => {
    // 配置加载中
    if (isConfigLoading) {
      return [
        {
          data: { message: t('aiProviders.detail.loading', { ns: 'setting' }) },
          id: 'config-loading',
          type: 'empty',
        },
      ];
    }

    // 配置加载失败
    if (!providerDetail) {
      return [
        {
          data: { message: t('aiProviders.detail.loadFailed', { ns: 'setting' }) },
          id: 'config-error',
          type: 'empty',
        },
      ];
    }

    return [
      {
        data: providerDetail,
        id: 'configuration',
        type: 'configuration',
      },
    ];
  }, [providerDetail, isConfigLoading, t]);

  // Models 标签页数据
  const modelsData = useMemo<FlashListItem[]>(() => {
    if (!providerDetail) return [];

    // 直接构建 Models 数据，不包含 provider-info 和 configuration
    return buildModelsData([]);
  }, [providerDetail, buildModelsData]);

  const renderItem = useCallback(
    ({ item }: { item: FlashListItem }) => {
      switch (item.type) {
        case 'configuration': {
          return <ConfigurationSection provider={item.data} setLoading={setLoading} />;
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
          return (
            <ModelCard model={item.data} onToggle={handleToggleModel} setLoading={setLoading} />
          );
        }

        case 'empty': {
          return (
            <Center paddingBlock={24}>
              <Empty description={item.data.message} />
            </Center>
          );
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

  // 严重错误时的全屏错误提示（仅在没有任何数据且加载完成后显示）
  if (error && !isLoading && !builtinProviderCard) {
    return (
      <PageContainer
        loading={loading}
        showBack
        title={headerTitle === 'lobehub' ? 'LobeHub' : headerTitle}
      >
        <Center paddingBlock={24}>
          <Empty description={t('aiProviders.detail.loadFailed', { ns: 'setting' })} flex={1} />
        </Center>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      loading={loading}
      showBack
      title={headerTitle === 'lobehub' ? 'LobeHub' : headerTitle}
    >
      <ProviderInfoSection
        provider={{ ...builtinProviderCard, ...providerDetail } as any}
        setLoading={setLoading}
      />
      <Flexbox
        paddingInline={16}
        style={{
          paddingBottom: 8,
        }}
      >
        <Segmented
          block
          onChange={(v) => setTab(v as Tabs)}
          options={[
            {
              icon: LucideSettings2,
              label: t('providersDetail.tabs.configuration', { ns: 'setting' }),
              value: Tabs.Configuration,
            },
            {
              icon: BrainIcon,
              label: t('providersDetail.tabs.models', { ns: 'setting' }),
              value: Tabs.Models,
            },
          ]}
          value={tab}
        />
      </Flexbox>
      <TabView
        items={[
          {
            children: (
              <FlashList
                data={configurationData}
                drawDistance={500}
                getItemType={(item) => item.type}
                keyExtractor={keyExtractor}
                onEndReached={handleEndReached}
                onEndReachedThreshold={0.2}
                removeClippedSubviews={true}
                renderItem={renderItem}
                showsVerticalScrollIndicator={true}
              />
            ),
            key: Tabs.Configuration,
          },
          {
            children: (
              <FlashList
                ListFooterComponent={renderFooter}
                data={modelsData}
                drawDistance={500}
                getItemType={(item) => item.type}
                keyExtractor={keyExtractor}
                onEndReached={handleEndReached}
                onEndReachedThreshold={0.2}
                removeClippedSubviews={true}
                renderItem={renderItem}
                showsVerticalScrollIndicator={true}
              />
            ),
            key: Tabs.Models,
          },
        ]}
        onChange={(v) => setTab(v as Tabs)}
        value={tab}
      />
    </PageContainer>
  );
};

export default ProviderDetailPage;
