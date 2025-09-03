import React, { useState, memo, ReactNode } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView, Modal } from 'react-native';
import { CheckCircle, XCircle, ChevronDown, Loader2, X } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { ModelIcon } from '@lobehub/icons-rn';

import { useThemeToken } from '@/theme';
import { chatService } from '@/services/chat';
import { ChatMessageError } from '@/types/message';
import { TraceNameMap } from '@/const/trace';
import { aiModelSelectors, aiProviderSelectors, useAiInfraStore } from '@/store/aiInfra';
import { useProviderName } from '@/hooks/useProviderName';

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

// Error component for detailed error display
const ErrorDisplay = memo<{ error: ChatMessageError }>(({ error }) => {
  const { styles } = useStyles();
  const token = useThemeToken();
  const { t } = useTranslation('error');
  const [showDetails, setShowDetails] = useState(false);
  const providerName = useProviderName(error.body?.provider);

  return (
    <View style={styles.errorContainer}>
      <View style={styles.errorHeader}>
        <View style={styles.errorMainContent}>
          <XCircle color={token.colorError} size={16} />
          <Text style={styles.errorMessage}>
            {t(`response.${error.type}` as any, { provider: providerName }) || error.message}
          </Text>
        </View>
        <TouchableOpacity onPress={() => setShowDetails(!showDetails)}>
          <ChevronDown
            color={token.colorTextSecondary}
            size={16}
            style={{ transform: [{ rotate: showDetails ? '180deg' : '0deg' }] }}
          />
        </TouchableOpacity>
      </View>

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

    // 获取模型信息的辅助函数
    const getModelInfo = useAiInfraStore((s) => (modelId: string) => {
      return s.aiProviderModelList.find((m) => m.id === modelId);
    });

    // State
    const [loading, setLoading] = useState(false);
    const [pass, setPass] = useState(false);
    const [checkModel, setCheckModel] = useState(model);
    const [error, setError] = useState<ChatMessageError | undefined>();
    const [showModelModal, setShowModelModal] = useState(false);

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
      await updateAiProviderConfig(provider, {
        ...currentConfig,
        checkModel: modelId,
      });
      setShowModelModal(false);
    };

    const defaultError = error ? <ErrorDisplay error={error} /> : null;
    const errorContent = CheckErrorRender ? (
      <CheckErrorRender defaultError={defaultError} error={error} setError={setError} />
    ) : (
      defaultError
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
                <Loader2 color={token.colorTextSecondary} size={16} />
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
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setShowModelModal(false)}
            style={styles.modalOverlay}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {t('providerModels.config.checker.selectModel')}
                </Text>
                <TouchableOpacity onPress={() => setShowModelModal(false)}>
                  <X color={token.colorTextSecondary} size={20} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalList}>
                {totalModels.map((modelId) => {
                  const modelInfo = getModelInfo(modelId);
                  return (
                    <TouchableOpacity
                      key={modelId}
                      onPress={() => handleModelChange(modelId)}
                      style={[styles.modalItem, checkModel === modelId && styles.modalItemSelected]}
                    >
                      <View style={styles.modalItemContent}>
                        <ModelIcon model={modelId} size={20} />
                        <Text
                          style={[
                            styles.modalItemText,
                            checkModel === modelId && styles.modalItemTextSelected,
                          ]}
                        >
                          {modelInfo?.displayName || modelId}
                        </Text>
                      </View>
                      {checkModel === modelId && (
                        <CheckCircle color={token.colorPrimary} size={16} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </TouchableOpacity>
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
