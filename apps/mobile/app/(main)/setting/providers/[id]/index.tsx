import { AiProviderDetailItem } from '@lobechat/types';
import { ModelIcon } from '@lobehub/icons-rn';
import {
  Button,
  Input,
  InstantSwitch,
  ModelInfoTags,
  PageContainer,
  Tag,
  useToast,
} from '@lobehub/ui-rn';
import Clipboard from '@react-native-clipboard/clipboard';
import { FlashList } from '@shopify/flash-list';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { RefreshCcw } from 'lucide-react-native';
import { AiProviderModelListItem } from 'model-bank';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from 'react-native';

import { DEFAULT_MODEL_PROVIDER_LIST } from '@/config/modelProviders';
import ConfigurationSection from '@/features/setting/providers/ConfigurationSection';
import ProviderInfoSection from '@/features/setting/providers/ProviderInfoSection';
import { aiProviderSelectors, useAiInfraStore } from '@/store/aiInfra';
import { aiModelSelectors } from '@/store/aiInfra/selectors';
import { useTheme } from '@/theme';

import { useStyles } from './styles';

// 定义FlashList数据项类型
type FlashListItem =
  | { data: AiProviderDetailItem; id: string; type: 'provider-info' }
  | { data: AiProviderDetailItem; id: string; type: 'configuration' }
  | {
      data: { isFetching: boolean; searchKeyword: string; totalCount: number };
      id: string;
      type: 'models-header';
    }
  | { data: { count: number; title: string }; id: string; type: 'section-header' }
  | { data: AiProviderModelListItem; id: string; type: 'model' }
  | { data: { message: string }; id: string; type: 'empty' };

// ModelCard组件（从ModelsSection提取）
const ModelCard = React.memo<{
  model: AiProviderModelListItem;
  onToggle: (_modelId: string, _enabled: boolean) => void;
}>(({ model, onToggle }) => {
  const { styles } = useStyles();
  const toast = useToast();
  const { t } = useTranslation(['setting']);

  const handleToggle = (value: boolean) => {
    onToggle(model.id, value);
  };

  const handleCopyModelId = () => {
    Clipboard.setString(model.id);
    toast.success(t('aiProviders.models.copySuccess', { ns: 'setting' }));
  };

  return (
    <View style={styles.modelCard}>
      <View style={styles.modelCardContent}>
        <ModelIcon model={model.id} size={32} />
        <View style={styles.modelInfo}>
          <View style={styles.modelTopRow}>
            <Text style={styles.modelName}>{model.displayName || model.id}</Text>
            <ModelInfoTags {...model.abilities} contextWindowTokens={model.contextWindowTokens} />
          </View>
          <TouchableOpacity onPress={handleCopyModelId} style={styles.modelBottomRow}>
            <Tag style={styles.modelIdTag} textStyle={styles.modelIdText}>
              {model.id}
            </Tag>
          </TouchableOpacity>
        </View>

        <View style={styles.modelSwitchContainer}>
          <InstantSwitch
            enabled={model.enabled}
            onChange={async (enabled) => {
              handleToggle(enabled);
            }}
            size="small"
          />
        </View>
      </View>
    </View>
  );
});

const ProviderDetailPage = () => {
  const navigation = useNavigation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { styles } = useStyles();
  const { t } = useTranslation(['setting']);
  const token = useTheme();
  const toast = useToast();

  // Models相关状态（从ModelsSection移过来）
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const [displayedCount, setDisplayedCount] = useState(20);

  // Store hooks for models
  const { useFetchAiProviderModels, fetchRemoteModelList, toggleModelEnabled } = useAiInfraStore();
  const { data: modelList, isLoading: isModelsLoading } = useFetchAiProviderModels(id!);
  const totalModels = useAiInfraStore(aiModelSelectors.totalAiProviderModelList);

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

        // 保持checkModel的默认值，只有用户明确配置了才使用用户的值
        checkModel: userConfig?.checkModel ?? builtinProviderCard.checkModel,

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

  // 模型相关处理函数
  const handleFetchModels = useCallback(async () => {
    setIsFetching(true);
    try {
      await fetchRemoteModelList(id!);
      toast.success(t('aiProviders.models.fetchSuccess', { ns: 'setting' }));
    } catch (error) {
      console.error('Failed to fetch models:', error);
      Alert.alert(
        t('error', { ns: 'common' }),
        t('aiProviders.models.fetchFailed', { ns: 'setting' }),
      );
    } finally {
      setIsFetching(false);
    }
  }, [id, fetchRemoteModelList, toast, t]);

  const handleToggleModel = useCallback(
    async (modelId: string, enabled: boolean) => {
      try {
        await toggleModelEnabled({ enabled, id: modelId });
        console.log(`Model ${modelId} ${enabled ? 'enabled' : 'disabled'}`);
      } catch (error) {
        console.error(`Failed to toggle model ${modelId}:`, error);
        Alert.alert(
          t('error', { ns: 'common' }),
          enabled
            ? t('aiProviders.models.enableFailed', { ns: 'setting' })
            : t('aiProviders.models.disableFailed', { ns: 'setting' }),
        );
      }
    },
    [toggleModelEnabled, t],
  );

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

  // 重置显示数量当搜索关键词变化时
  useEffect(() => {
    setDisplayedCount(20);
  }, [searchKeyword]);

  const headerTitle = providerDetail?.name || id || '';

  // 处理模型数据（不包含UI逻辑）
  const { enabledModels, disabledModels, totalFilteredCount } = useMemo(() => {
    if (!modelList) return { disabledModels: [], enabledModels: [], totalFilteredCount: 0 };

    const filtered = modelList.filter((model) => {
      if (!searchKeyword.trim()) return true;
      const keyword = searchKeyword.toLowerCase();
      return (
        model.id.toLowerCase().includes(keyword) ||
        model.displayName?.toLowerCase().includes(keyword)
      );
    });

    const enabled = filtered.filter((model) => model.enabled);
    const disabled = filtered.filter((model) => !model.enabled);

    return {
      disabledModels: disabled,
      enabledModels: enabled,
      totalFilteredCount: enabled.length + disabled.length,
    };
  }, [modelList, searchKeyword]);

  // 构建FlashList统一数据结构
  const flashListData = useMemo<FlashListItem[]>(() => {
    if (!providerDetail) return [];

    const items: FlashListItem[] = [];

    // 1. Provider信息section和Configuration section
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
      {
        data: {
          isFetching,
          searchKeyword,
          totalCount: totalModels,
        },
        id: 'models-header',
        type: 'models-header',
      },
    );

    // 4. Models数据处理
    if (isModelsLoading) {
      return items;
    }

    if (totalFilteredCount === 0) {
      items.push({
        data: {
          message: searchKeyword.trim()
            ? t('aiProviders.models.emptyWithSearch', { ns: 'setting' })
            : t('aiProviders.models.emptyNoSearch', { ns: 'setting' }),
        },
        id: 'empty-models',
        type: 'empty',
      });
      return items;
    }

    // 5. 启用的模型
    if (enabledModels.length > 0) {
      items.push({
        data: {
          count: enabledModels.length,
          title: t('aiProviders.list.enabled', { ns: 'setting' }),
        },
        id: 'enabled-header',
        type: 'section-header',
      });

      // 添加显示的启用模型
      const displayedEnabled = enabledModels.slice(
        0,
        Math.min(displayedCount, enabledModels.length),
      );
      displayedEnabled.forEach((model) => {
        items.push({
          data: model,
          id: `model-${model.id}`,
          type: 'model',
        });
      });
    }

    // 6. 禁用的模型
    const remainingCount = Math.max(0, displayedCount - enabledModels.length);
    if (disabledModels.length > 0 && remainingCount > 0) {
      items.push({
        data: {
          count: disabledModels.length,
          title: t('aiProviders.list.disabled', { ns: 'setting' }),
        },
        id: 'disabled-header',
        type: 'section-header',
      });

      // 添加显示的禁用模型
      const displayedDisabled = disabledModels.slice(0, remainingCount);
      displayedDisabled.forEach((model) => {
        items.push({
          data: model,
          id: `model-${model.id}`,
          type: 'model',
        });
      });
    }

    return items;
  }, [
    providerDetail,
    searchKeyword,
    totalModels,
    isFetching,
    isModelsLoading,
    enabledModels,
    disabledModels,
    totalFilteredCount,
    displayedCount,
    t,
  ]);

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
            <View style={styles.modelsHeader}>
              <View style={styles.modelsTitleRow}>
                <View style={styles.modelsTitleContainer}>
                  <Text style={styles.modelsTitle}>
                    {t('aiProviders.models.title', { ns: 'setting' })}
                  </Text>
                  <Text style={styles.modelsCount}>
                    {t('aiProviders.models.modelsAvailable', {
                      count: item.data.totalCount,
                      ns: 'setting',
                    })}
                  </Text>
                </View>

                <View style={styles.modelsActions}>
                  <Button
                    disabled={item.data.isFetching}
                    icon={<RefreshCcw />}
                    loading={item.data.isFetching}
                    onPress={handleFetchModels}
                    type="primary"
                  >
                    {item.data.isFetching
                      ? t('aiProviders.models.fetching', { ns: 'setting' })
                      : t('aiProviders.models.fetch', { ns: 'setting' })}
                  </Button>
                </View>
              </View>

              <Input.Search
                onChangeText={setSearchKeyword}
                placeholder={t('aiProviders.models.searchPlaceholder', { ns: 'setting' })}
                size="large"
                style={styles.modelsSearchInput}
                value={searchKeyword}
                variant="outlined"
              />
            </View>
          );
        }

        case 'section-header': {
          return (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionHeaderText}>
                {item.data.title} ({item.data.count})
              </Text>
            </View>
          );
        }

        case 'model': {
          return <ModelCard model={item.data} onToggle={handleToggleModel} />;
        }

        case 'empty': {
          return (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>{item.data.message}</Text>
            </View>
          );
        }

        default: {
          return null;
        }
      }
    },
    [
      styles,
      token,
      t,
      handleFetchModels,
      handleToggleModel,
      searchKeyword,
      setSearchKeyword,
      setDisplayedCount,
    ],
  );

  // FlashList的keyExtractor
  const keyExtractor = useCallback((item: FlashListItem) => item.id, []);

  // 自动加载更多
  const handleEndReached = useCallback(() => {
    if (displayedCount < totalFilteredCount) {
      setDisplayedCount((prev) => Math.min(prev + 20, totalFilteredCount));
    }
  }, [displayedCount, totalFilteredCount]);

  // ListFooterComponent - 优雅的加载提示
  const renderFooter = useCallback(() => {
    if (isModelsLoading) {
      return (
        <View style={styles.footerLoading}>
          <ActivityIndicator color={token.colorPrimary} size="small" />
          <Text style={styles.footerText}>
            {t('aiProviders.models.loading', { ns: 'setting' })}
          </Text>
        </View>
      );
    }

    if (displayedCount < totalFilteredCount) {
      return (
        <View style={styles.footerLoading}>
          <ActivityIndicator color={token.colorTextSecondary} size="small" />
          <Text style={styles.footerText}>
            {t('aiProviders.models.loadingMore', { ns: 'setting' })} ({displayedCount}/
            {totalFilteredCount})
          </Text>
        </View>
      );
    }

    if (totalFilteredCount > 0) {
      return (
        <View style={styles.footerComplete}>
          <Text style={styles.footerCompleteText}>
            {t('aiProviders.models.allLoaded', { ns: 'setting' })} ({totalFilteredCount})
          </Text>
        </View>
      );
    }

    return null;
  }, [isModelsLoading, displayedCount, totalFilteredCount, token, t]);

  if (isLoading || isConfigLoading) {
    return (
      <PageContainer showBack title={headerTitle}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>
            {t('aiProviders.detail.loading', { ns: 'setting' })}
          </Text>
        </View>
      </PageContainer>
    );
  }

  if (error || (!providerDetail && !isLoading && !isConfigLoading)) {
    return (
      <PageContainer showBack title={headerTitle}>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>
            {t('aiProviders.detail.loadFailed', { ns: 'setting' })}
          </Text>
        </View>
      </PageContainer>
    );
  }

  if (!providerDetail) {
    return null;
  }

  return (
    <PageContainer showBack title={headerTitle}>
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
    </PageContainer>
  );
};

export default ProviderDetailPage;
