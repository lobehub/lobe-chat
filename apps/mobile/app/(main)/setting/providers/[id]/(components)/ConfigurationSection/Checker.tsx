import React, { useState, memo, ReactNode, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  FlatList,
  ListRenderItem,
  ScrollView,
} from 'react-native';
import { CheckCircle, XCircle, ChevronDown, X } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { ModelIcon } from '@lobehub/icons-rn';

import { useThemeToken } from '@/theme';
import { chatService } from '@/services/chat';
import { ChatMessageError } from '@/types/message';
import { aiModelSelectors, aiProviderSelectors, useAiInfraStore } from '@/store/aiInfra';
import { useProviderName } from '@/hooks/useProviderName';

import { useStyles } from './style';
import { TraceNameMap } from '@lobechat/types';

export type CheckErrorRender = (props: {
  defaultError: ReactNode;
  error?: ChatMessageError;
  setError: (error?: ChatMessageError) => void;
}) => ReactNode;

interface CheckerProps {
  checkErrorRender?: CheckErrorRender;
  model: string;
  onAfterCheck: () => Promise<void>;
  onBeforeCheck: () => Promise<void>;
  provider: string;
}

// Model item height constant for FlatList optimization
const MODEL_ITEM_HEIGHT = 56;

// Model option type
interface ModelOption {
  displayName: string;
  id: string;
  isSelected: boolean;
}

// Model item component - optimized with React.memo
const ModelItem = memo<{
  model: ModelOption;
  onSelect: (_id: string) => void;
  styles: any;
  token: any;
}>(
  ({ model, onSelect, styles, token }) => {
    return (
      <TouchableOpacity
        onPress={() => onSelect(model.id)}
        style={[styles.modalItem, model.isSelected && styles.modalItemSelected]}
      >
        <View style={styles.modalItemContent}>
          <ModelIcon model={model.id} size={20} />
          <Text style={[styles.modalItemText, model.isSelected && styles.modalItemTextSelected]}>
            {model.displayName}
          </Text>
        </View>
        {model.isSelected && <CheckCircle color={token.colorPrimary} size={16} />}
      </TouchableOpacity>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison for better performance
    return (
      prevProps.model.isSelected === nextProps.model.isSelected &&
      prevProps.model.id === nextProps.model.id
    );
  },
);

// Error component for detailed error display
const ErrorDisplay = memo<{ error: ChatMessageError }>(({ error }) => {
  const { styles } = useStyles();
  const token = useThemeToken();
  const { t } = useTranslation('error');
  const [showDetails, setShowDetails] = useState(false);
  const providerName = useProviderName(error.body?.provider);

  return (
    <View style={styles.errorContainer}>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => setShowDetails(!showDetails)}
        style={styles.errorHeader}
      >
        <View style={styles.errorMainContent}>
          <XCircle color={token.colorError} size={16} />
          <Text style={styles.errorMessage}>
            {t(`response.${error.type}` as any, { provider: providerName }) || error.message}
          </Text>
        </View>
        <ChevronDown
          color={token.colorTextSecondary}
          size={16}
          style={{ transform: [{ rotate: showDetails ? '180deg' : '0deg' }] }}
        />
      </TouchableOpacity>

      {showDetails && (
        <ScrollView horizontal style={styles.errorDetails}>
          <Text style={styles.errorDetailsText}>
            {JSON.stringify(error.body || error, null, 2)}
          </Text>
        </ScrollView>
      )}
    </View>
  );
});

const Checker = memo<CheckerProps>(
  ({ model, provider, checkErrorRender: CheckErrorRender, onBeforeCheck, onAfterCheck }) => {
    const { styles } = useStyles();
    const token = useThemeToken();
    const { t } = useTranslation(['setting']);

    // Store hooks
    const isProviderConfigUpdating = useAiInfraStore(
      aiProviderSelectors.isProviderConfigUpdating(provider),
    );
    const totalModels = useAiInfraStore(aiModelSelectors.aiProviderChatModelListIds);
    const updateAiProviderConfig = useAiInfraStore((s) => s.updateAiProviderConfig);
    const currentConfig = useAiInfraStore(aiProviderSelectors.providerConfigById(provider));
    const aiProviderModelList = useAiInfraStore((s) => s.aiProviderModelList);

    // Create model info map for O(1) lookup performance
    const modelInfoMap = useMemo(() => {
      const map = new Map<string, any>();
      aiProviderModelList.forEach((model) => {
        map.set(model.id, model);
      });
      return map;
    }, [aiProviderModelList]);

    // 获取模型信息的辅助函数 - optimized with Map
    const getModelInfo = useCallback(
      (modelId: string) => {
        return modelInfoMap.get(modelId);
      },
      [modelInfoMap],
    );

    // State
    const [loading, setLoading] = useState(false);
    const [pass, setPass] = useState(false);
    const [checkModel, setCheckModel] = useState(model);
    const [error, setError] = useState<ChatMessageError | undefined>();
    const [showModelModal, setShowModelModal] = useState(false);

    // Pre-compute model options to avoid re-calculation during render
    const modelOptions = useMemo<ModelOption[]>(() => {
      return totalModels.map((modelId) => ({
        displayName: getModelInfo(modelId)?.displayName || modelId,
        id: modelId,
        isSelected: checkModel === modelId,
      }));
    }, [totalModels, checkModel, getModelInfo]);

    const checkConnection = async () => {
      // Clear previous check results
      setPass(false);
      setError(undefined);

      let isError = false;

      await chatService.fetchPresetTaskResult({
        onError: (_, rawError) => {
          setError(rawError);
          setPass(false);
          isError = true;
        },
        onFinish: async (value) => {
          if (!isError && value) {
            setError(undefined);
            setPass(true);
          } else {
            setPass(false);
            setError({
              body: value,
              message: t('response.ConnectionCheckFailed', { ns: 'error' }),
              type: 'ConnectionCheckFailed',
            });
          }
        },
        onLoadingChange: (loading) => {
          setLoading(loading);
        },
        params: {
          messages: [
            {
              content: 'hello',
              role: 'user',
            },
          ],
          model: checkModel,
          provider,
        },
        trace: {
          sessionId: `connection:${provider}`,
          topicId: checkModel,
          traceName: TraceNameMap.ConnectivityChecker,
        },
      });
    };

    const handleCheckPress = async () => {
      await onBeforeCheck();
      try {
        await checkConnection();
      } finally {
        await onAfterCheck();
      }
    };

    const handleModelChange = async (modelId: string) => {
      setCheckModel(modelId);
      setShowModelModal(false);
      await updateAiProviderConfig(provider, {
        ...currentConfig,
        checkModel: modelId,
      });
    };

    const defaultError = error ? <ErrorDisplay error={error} /> : null;
    const errorContent = CheckErrorRender ? (
      <CheckErrorRender defaultError={defaultError} error={error} setError={setError} />
    ) : (
      defaultError
    );

    // FlatList renderItem callback
    const renderModelItem: ListRenderItem<ModelOption> = useCallback(
      ({ item }) => (
        <ModelItem model={item} onSelect={handleModelChange} styles={styles} token={token} />
      ),
      [handleModelChange, styles, token],
    );

    // FlatList getItemLayout for better performance
    const getItemLayout = useCallback(
      (_data: ArrayLike<ModelOption> | null | undefined, index: number) => ({
        index,
        length: MODEL_ITEM_HEIGHT,
        offset: MODEL_ITEM_HEIGHT * index,
      }),
      [],
    );

    return (
      <View style={styles.checkerContainer}>
        {/* Model selector and check button */}
        <View style={styles.checkerRow}>
          <TouchableOpacity
            disabled={isProviderConfigUpdating || loading}
            onPress={() => setShowModelModal(true)}
            style={[
              styles.modelSelector,
              (isProviderConfigUpdating || loading) && styles.modelSelectorDisabled,
            ]}
          >
            <View style={styles.modelSelectorContent}>
              <ModelIcon model={checkModel} size={20} />
              <Text
                numberOfLines={1}
                style={[
                  styles.modelSelectorText,
                  (isProviderConfigUpdating || loading) && styles.modelSelectorTextDisabled,
                ]}
              >
                {getModelInfo(checkModel)?.displayName || checkModel}
              </Text>
            </View>
            <View style={styles.modelSelectorIcon}>
              {isProviderConfigUpdating ? (
                <ActivityIndicator color={token.colorTextSecondary} size="small" />
              ) : (
                <ChevronDown color={token.colorTextSecondary} size={16} />
              )}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            disabled={isProviderConfigUpdating || loading}
            onPress={handleCheckPress}
            style={[
              styles.checkButton,
              (isProviderConfigUpdating || loading) && styles.checkButtonDisabled,
            ]}
          >
            {loading ? (
              <ActivityIndicator color={token.colorTextLightSolid} size="small" />
            ) : (
              <Text style={styles.checkButtonText}>
                {t('providerModels.config.checker.button')}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Model selector modal */}
        <Modal
          animationType="slide"
          onRequestClose={() => setShowModelModal(false)}
          transparent={true}
          visible={showModelModal}
        >
          {/* Background overlay - separate clickable area */}
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setShowModelModal(false)}
            style={styles.modalBackdrop}
          />

          {/* Content wrapper - allows touch events to pass through */}
          <View pointerEvents="box-none" style={styles.modalWrapper}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {t('providerModels.config.checker.selectModel')}
                </Text>
                <TouchableOpacity onPress={() => setShowModelModal(false)}>
                  <X color={token.colorTextSecondary} size={20} />
                </TouchableOpacity>
              </View>

              <FlatList
                bounces={true}
                data={modelOptions}
                getItemLayout={getItemLayout}
                initialNumToRender={10}
                keyExtractor={(item) => item.id}
                maxToRenderPerBatch={10}
                removeClippedSubviews={true}
                renderItem={renderModelItem}
                showsVerticalScrollIndicator={true}
                style={styles.modalList}
                windowSize={10}
              />
            </View>
          </View>
        </Modal>

        {/* Success status */}
        {pass && (
          <View style={styles.statusContainer}>
            <CheckCircle color={token.colorSuccess} size={16} />
            <Text style={[styles.statusText, { color: token.colorSuccess }]}>
              {t('providerModels.config.checker.pass')}
            </Text>
          </View>
        )}

        {/* Error display */}
        {error && errorContent}
      </View>
    );
  },
);

export default Checker;
