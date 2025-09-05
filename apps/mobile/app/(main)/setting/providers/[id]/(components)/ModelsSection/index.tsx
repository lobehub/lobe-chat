import React, { useState, useCallback, useMemo, memo } from 'react';
import { View, Text, TouchableOpacity, Alert, FlatList } from 'react-native';
import { RefreshCcw } from 'lucide-react-native';
import { TextInput, Button, InstantSwitch, ModelInfoTags, Tag, useToast } from '@/components';
import { ModelIcon } from '@lobehub/icons-rn';
import Clipboard from '@react-native-clipboard/clipboard';
import { useTranslation } from 'react-i18next';

import { useAiInfraStore } from '@/store/aiInfra';
import { aiModelSelectors } from '@/store/aiInfra/selectors';
import { AiProviderModelListItem } from '@/types/aiModel';

import { useStyles } from './style';
import ModelListSkeleton from '../ModelListSkeleton';

interface ModelsSectionProps {
  providerId: string;
}

interface ModelCardProps {
  model: AiProviderModelListItem;
  onToggle: (modelId: string, enabled: boolean) => void;
}

const ModelCard = memo<ModelCardProps>(({ model, onToggle }) => {
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
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <ModelIcon model={model.id} size={32} />
        <View style={styles.modelInfo}>
          <View style={styles.topRow}>
            <Text style={styles.modelName}>{model.displayName || model.id}</Text>
            <ModelInfoTags {...model.abilities} contextWindowTokens={model.contextWindowTokens} />
          </View>
          <TouchableOpacity onPress={handleCopyModelId} style={styles.bottomRow}>
            <Tag style={styles.modelIdTag} textStyle={styles.modelIdText}>
              {model.id}
            </Tag>
          </TouchableOpacity>
        </View>

        <View style={styles.switchContainer}>
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

const ModelsSection = memo<ModelsSectionProps>(({ providerId }) => {
  const { styles } = useStyles();
  const toast = useToast();
  const { t } = useTranslation(['setting']);

  // Store hooks
  const { useFetchAiProviderModels, fetchRemoteModelList, toggleModelEnabled } = useAiInfraStore();
  const { data: modelList, isLoading } = useFetchAiProviderModels(providerId);
  const totalModels = useAiInfraStore(aiModelSelectors.totalAiProviderModelList);

  // State
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isFetching, setIsFetching] = useState(false);

  const handleFetchModels = useCallback(async () => {
    setIsFetching(true);
    try {
      await fetchRemoteModelList(providerId);
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
  }, [providerId, fetchRemoteModelList]);

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
    [toggleModelEnabled],
  );

  // Filter and flatten models for FlatList
  const flatListData = useMemo(() => {
    if (!modelList) return [];

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

    const flatData: Array<
      { title: string; type: 'header' } | { data: AiProviderModelListItem; type: 'model' }
    > = [];

    if (enabled.length > 0) {
      flatData.push({
        title: `${t('aiProviders.list.enabled', { ns: 'setting' })} (${enabled.length})`,
        type: 'header',
      });
      enabled.forEach((model) => flatData.push({ data: model, type: 'model' }));
    }

    if (disabled.length > 0) {
      flatData.push({
        title: `${t('aiProviders.list.disabled', { ns: 'setting' })} (${disabled.length})`,
        type: 'header',
      });
      disabled.forEach((model) => flatData.push({ data: model, type: 'model' }));
    }

    return flatData;
  }, [modelList, searchKeyword]);

  // FlatList render functions
  const renderItem = useCallback(
    ({
      item,
    }: {
      item: { title: string; type: 'header' } | { data: AiProviderModelListItem; type: 'model' };
    }) => {
      if (item.type === 'header') {
        return (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>{item.title}</Text>
          </View>
        );
      }

      return <ModelCard model={item.data} onToggle={handleToggleModel} />;
    },
    [styles, handleToggleModel],
  );

  const keyExtractor = useCallback(
    (
      item: { title: string; type: 'header' } | { data: AiProviderModelListItem; type: 'model' },
    ) => {
      if (item.type === 'header') {
        return `header-${item.title}`;
      }
      return `model-${item.data.id}`;
    },
    [],
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={styles.titleContainer}>
            <Text style={styles.sectionTitle}>
              {t('aiProviders.models.title', { ns: 'setting' })}
            </Text>
            <Text style={styles.modelCount}>
              {t('aiProviders.models.modelsAvailable', { count: totalModels, ns: 'setting' })}
            </Text>
          </View>

          <View style={styles.actionsContainer}>
            <Button
              disabled={isFetching}
              icon={<RefreshCcw />}
              onPress={handleFetchModels}
              type="primary"
            >
              {isFetching
                ? t('aiProviders.models.fetching', { ns: 'setting' })
                : t('aiProviders.models.fetch', { ns: 'setting' })}
            </Button>
          </View>
        </View>

        <TextInput.Search
          onChangeText={setSearchKeyword}
          placeholder={t('aiProviders.models.searchPlaceholder', { ns: 'setting' })}
          style={styles.searchInput}
          value={searchKeyword}
        />
      </View>

      {isLoading ? (
        <ModelListSkeleton />
      ) : flatListData.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {searchKeyword.trim()
              ? t('aiProviders.models.emptyWithSearch', { ns: 'setting' })
              : t('aiProviders.models.emptyNoSearch', { ns: 'setting' })}
          </Text>
        </View>
      ) : (
        <FlatList
          data={flatListData}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
});

export default ModelsSection;
