import { BottomSheetBackdrop, BottomSheetFlashList, BottomSheetModal } from '@gorhom/bottom-sheet';
import type { BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import { ChatMessageError, TraceNameMap } from '@lobechat/types';
import { ModelIcon } from '@lobehub/icons-rn';
import { CheckCircle, ChevronDown, X, XCircle } from 'lucide-react-native';
import { ReactNode, memo, useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components';
import { useTheme } from '@/components/styles';
import { useProviderName } from '@/hooks/useProviderName';
import { chatService } from '@/services/chat';
import { aiModelSelectors, aiProviderSelectors, useAiInfraStore } from '@/store/aiInfra';

import { useStyles } from './style';

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

// Model list item height for FlashList optimization
const MODEL_ITEM_HEIGHT = 64;

interface ModelOption {
  displayName: string;
  id: string;
  isSelected: boolean;
}

interface ModelItemProps {
  model: ModelOption;
  onSelect: (id: string) => void;
  styles: ReturnType<typeof useStyles>['styles'];
  token: ReturnType<typeof useTheme>;
}

/**
 * Model list item with selection state
 */
const ModelItem = memo<ModelItemProps>(
  ({ model, onSelect, styles, token }) => (
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
  ),
  (prev, next) =>
    prev.model.isSelected === next.model.isSelected && prev.model.id === next.model.id,
);

ModelItem.displayName = 'ModelItem';

/**
 * Error display with expandable details
 */
const ErrorDisplay = memo<{ error: ChatMessageError }>(({ error }) => {
  const { styles } = useStyles();
  const token = useTheme();
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

ErrorDisplay.displayName = 'ErrorDisplay';

/**
 * Connection checker component with model selection
 */
const Checker = memo<CheckerProps>(
  ({ model, provider, checkErrorRender: CheckErrorRender, onBeforeCheck, onAfterCheck }) => {
    const { styles } = useStyles();
    const token = useTheme();
    const { t } = useTranslation(['setting']);
    const insets = useSafeAreaInsets();

    // Store state
    const isProviderConfigUpdating = useAiInfraStore(
      aiProviderSelectors.isProviderConfigUpdating(provider),
    );
    const totalModels = useAiInfraStore(aiModelSelectors.aiProviderChatModelListIds);
    const updateAiProviderConfig = useAiInfraStore((s) => s.updateAiProviderConfig);
    const currentConfig = useAiInfraStore(aiProviderSelectors.providerConfigById(provider));
    const aiProviderModelList = useAiInfraStore((s) => s.aiProviderModelList);

    // Local state
    const [loading, setLoading] = useState(false);
    const [pass, setPass] = useState(false);
    const [checkModel, setCheckModel] = useState(model);
    const [error, setError] = useState<ChatMessageError | undefined>();

    // Bottom sheet ref
    const bottomSheetModalRef = useRef<BottomSheetModal>(null);

    // Model info map for O(1) lookup
    const modelInfoMap = useMemo(() => {
      const map = new Map<string, any>();
      aiProviderModelList.forEach((model) => {
        map.set(model.id, model);
      });
      return map;
    }, [aiProviderModelList]);

    // Bottom sheet configuration - multiple snap points for resizing
    const snapPoints = useMemo(() => ['50%', '90%'], []);

    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          opacity={0.5}
          pressBehavior="close"
        />
      ),
      [],
    );

    // Model options for the list
    const modelOptions = useMemo<ModelOption[]>(
      () =>
        totalModels.map((modelId) => ({
          displayName: modelInfoMap.get(modelId)?.displayName || modelId,
          id: modelId,
          isSelected: checkModel === modelId,
        })),
      [totalModels, checkModel, modelInfoMap],
    );

    // Handlers
    const checkConnection = useCallback(async () => {
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
        onLoadingChange: setLoading,
        params: {
          messages: [{ content: 'hello', role: 'user' }],
          model: checkModel,
          provider,
        },
        trace: {
          sessionId: `connection:${provider}`,
          topicId: checkModel,
          traceName: TraceNameMap.ConnectivityChecker,
        },
      });
    }, [checkModel, provider, t]);

    const handleCheckPress = useCallback(async () => {
      await onBeforeCheck();
      try {
        await checkConnection();
      } finally {
        await onAfterCheck();
      }
    }, [onBeforeCheck, checkConnection, onAfterCheck]);

    const handleModelChange = useCallback(
      async (modelId: string) => {
        setCheckModel(modelId);
        bottomSheetModalRef.current?.dismiss();
        await updateAiProviderConfig(provider, {
          ...currentConfig,
          checkModel: modelId,
        });
      },
      [provider, currentConfig, updateAiProviderConfig],
    );

    const renderModelItem = useCallback(
      ({ item }: { item: ModelOption }) => (
        <ModelItem model={item} onSelect={handleModelChange} styles={styles} token={token} />
      ),
      [handleModelChange, styles, token],
    );

    const renderListHeader = useCallback(
      () => (
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{t('providerModels.config.checker.selectModel')}</Text>
          <TouchableOpacity onPress={() => bottomSheetModalRef.current?.dismiss()}>
            <X color={token.colorTextSecondary} size={20} />
          </TouchableOpacity>
        </View>
      ),
      [styles.modalHeader, styles.modalTitle, t, token.colorTextSecondary],
    );

    const renderListFooter = useCallback(() => <View style={{ height: 16 }} />, []);

    // Error rendering
    const defaultError = error ? <ErrorDisplay error={error} /> : null;
    const errorContent = CheckErrorRender ? (
      <CheckErrorRender defaultError={defaultError} error={error} setError={setError} />
    ) : (
      defaultError
    );

    const isDisabled = isProviderConfigUpdating || loading;

    return (
      <View style={styles.checkerContainer}>
        <View style={styles.checkerRow}>
          <TouchableOpacity
            disabled={isDisabled}
            onPress={() => bottomSheetModalRef.current?.present()}
            style={[styles.modelSelector, isDisabled && styles.modelSelectorDisabled]}
          >
            <View style={styles.modelSelectorContent}>
              <ModelIcon model={checkModel} size={20} />
              <Text
                numberOfLines={1}
                style={[styles.modelSelectorText, isDisabled && styles.modelSelectorTextDisabled]}
              >
                {modelInfoMap.get(checkModel)?.displayName || checkModel}
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

          <Button
            disabled={isDisabled}
            loading={loading}
            onPress={handleCheckPress}
            size="large"
            type="primary"
          >
            {t('providerModels.config.checker.button')}
          </Button>
        </View>

        <BottomSheetModal
          backdropComponent={renderBackdrop}
          backgroundStyle={styles.bottomSheetBackground}
          enableDismissOnClose
          enableDynamicSizing={false}
          enablePanDownToClose
          handleIndicatorStyle={styles.bottomSheetHandle}
          ref={bottomSheetModalRef}
          snapPoints={snapPoints}
          topInset={insets.top}
        >
          <BottomSheetFlashList
            ListFooterComponent={renderListFooter}
            ListHeaderComponent={renderListHeader}
            data={modelOptions}
            estimatedItemSize={MODEL_ITEM_HEIGHT}
            keyExtractor={(item: ModelOption) => item.id}
            renderItem={renderModelItem}
            showsVerticalScrollIndicator
          />
        </BottomSheetModal>

        {pass && (
          <View style={styles.statusContainer}>
            <CheckCircle color={token.colorSuccess} size={16} />
            <Text style={[styles.statusText, { color: token.colorSuccess }]}>
              {t('providerModels.config.checker.pass')}
            </Text>
          </View>
        )}

        {error && errorContent}
      </View>
    );
  },
);

Checker.displayName = 'Checker';

export default Checker;
