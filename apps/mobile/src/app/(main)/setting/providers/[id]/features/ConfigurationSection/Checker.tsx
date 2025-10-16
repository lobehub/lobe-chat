import { ChatMessageError, TraceNameMap } from '@lobechat/types';
import { ModelIcon } from '@lobehub/icons-rn';
import { Button, Flexbox, Select, type SelectOptionItem, Text, useTheme } from '@lobehub/ui-rn';
import { CheckCircle, ChevronDown, XCircle } from 'lucide-react-native';
import { ReactNode, memo, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, TouchableOpacity, View } from 'react-native';

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

    // Model info map for O(1) lookup
    const modelInfoMap = useMemo(() => {
      const map = new Map<string, any>();
      aiProviderModelList.forEach((model) => {
        map.set(model.id, model);
      });
      return map;
    }, [aiProviderModelList]);

    // Model options for Select component
    const modelOptions = useMemo<SelectOptionItem[]>(
      () =>
        totalModels.map((modelId) => ({
          icon: <ModelIcon model={modelId} size={24} />,
          iconSize: 24,
          title: modelInfoMap.get(modelId)?.displayName || modelId,
          value: modelId,
        })),
      [totalModels, modelInfoMap],
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
      async (value: string | number) => {
        const modelId = String(value);
        setCheckModel(modelId);
        await updateAiProviderConfig(provider, {
          ...currentConfig,
          checkModel: modelId,
        });
      },
      [provider, currentConfig, updateAiProviderConfig],
    );

    // Error rendering
    const defaultError = error ? <ErrorDisplay error={error} /> : null;
    const errorContent = CheckErrorRender ? (
      <CheckErrorRender defaultError={defaultError} error={error} setError={setError} />
    ) : (
      defaultError
    );

    const isDisabled = isProviderConfigUpdating || loading;

    return (
      <Flexbox gap={16} style={styles.checkerContainer}>
        <Flexbox gap={12} horizontal>
          <Select
            bottomSheetProps={{
              snapPoints: ['50%', '80%'],
            }}
            disabled={isDisabled}
            onChange={handleModelChange}
            options={modelOptions}
            style={{ flex: 1 }}
            title={t('providerModels.config.checker.selectModel')}
            value={checkModel}
          />

          <Button disabled={isDisabled} loading={loading} onPress={handleCheckPress} type="primary">
            {t('providerModels.config.checker.button')}
          </Button>
        </Flexbox>

        {pass && (
          <Flexbox align="center" gap={8} horizontal style={styles.statusContainer}>
            <CheckCircle color={token.colorSuccess} size={16} />
            <Text fontSize={14} style={{ color: token.colorSuccess }}>
              {t('providerModels.config.checker.pass')}
            </Text>
          </Flexbox>
        )}

        {error && errorContent}
      </Flexbox>
    );
  },
);

Checker.displayName = 'Checker';

export default Checker;
