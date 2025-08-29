import React, { useState, useCallback, useMemo, memo } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, FlatList } from 'react-native';
import { RefreshCcw, Search } from 'lucide-react-native';
import { ModelIcon } from '@lobehub/icons-rn';
import Clipboard from '@react-native-clipboard/clipboard';

import { useThemeToken } from '@/theme';
import { useAiInfraStore } from '@/store/aiInfra';
import { aiModelSelectors } from '@/store/aiInfra/selectors';
import { AiProviderModelListItem } from '@/types/aiModel';
import { InstantSwitch, ModelInfoTags, Tag, useToast } from '@/components';

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
  const token = useThemeToken();
  const toast = useToast();

  const handleToggle = (value: boolean) => {
    onToggle(model.id, value);
  };

  const handleCopyModelId = () => {
    Clipboard.setString(model.id);
    toast.success('复制成功');
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
            thumbColor={token.colorBgContainer}
            trackColor={{
              false: '#e9e9eb',
              true: '#34c759',
            }}
          />
        </View>
      </View>
    </View>
  );
});

const ModelsSection = memo<ModelsSectionProps>(({ providerId }) => {
  const { styles } = useStyles();
  const token = useThemeToken();
  const toast = useToast();

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
      toast.success('Models fetched successfully!');
    } catch (error) {
      console.error('Failed to fetch models:', error);
      Alert.alert('Error', 'Failed to fetch models. Please try again.');
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
        Alert.alert('Error', `Failed to ${enabled ? 'enable' : 'disable'} model.`);
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
      flatData.push({ title: `Enabled (${enabled.length})`, type: 'header' });
      enabled.forEach((model) => flatData.push({ data: model, type: 'model' }));
    }

    if (disabled.length > 0) {
      flatData.push({ title: `Disabled (${disabled.length})`, type: 'header' });
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
            <Text style={styles.sectionTitle}>Models</Text>
            <Text style={styles.modelCount}>{totalModels} models available</Text>
          </View>

          <View style={styles.actionsContainer}>
            <TouchableOpacity
              disabled={isFetching}
              onPress={handleFetchModels}
              style={[styles.fetchButton, isFetching && styles.fetchButtonDisabled]}
            >
              <RefreshCcw
                color={isFetching ? token.colorTextTertiary : token.colorWhite}
                size={14}
              />
              <Text style={[styles.fetchButtonText, isFetching && styles.fetchButtonTextDisabled]}>
                {isFetching ? 'Fetching...' : 'Fetch models'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <Search color={token.colorTextSecondary} size={16} />
          <TextInput
            onChangeText={setSearchKeyword}
            placeholder="Search models..."
            placeholderTextColor={token.colorTextTertiary}
            style={styles.searchInput}
            value={searchKeyword}
          />
        </View>
      </View>

      {isLoading ? (
        <ModelListSkeleton />
      ) : flatListData.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {searchKeyword.trim()
              ? 'No models match your search criteria'
              : 'No models found for this provider.\nTry fetching models from the server.'}
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
