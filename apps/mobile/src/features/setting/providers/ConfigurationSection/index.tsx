import { AiProviderDetailItem } from '@lobechat/types';
import { Input } from '@lobehub/ui-rn';
import { Lock } from 'lucide-react-native';
import React, { memo, useCallback, useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, Linking, Text, View } from 'react-native';

import { AES_GCM_URL } from '@/_const/url';
import { useAiInfraStore } from '@/store/aiInfra';

import Checker from './Checker';
import { useStyles } from './style';

interface ConfigurationSectionProps {
  provider: AiProviderDetailItem;
}

const isValidUrl = (url: string) => {
  return !url || url.match(/^https?:\/\/.+/);
};

const ConfigurationSection = memo<ConfigurationSectionProps>(({ provider }) => {
  const { styles, theme } = useStyles();
  const { t } = useTranslation('setting');

  // Store hooks
  const { useFetchAiProviderItem, updateAiProviderConfig } = useAiInfraStore();
  const { data: providerData } = useFetchAiProviderItem(provider.id);

  // Form state
  const [apiKey, setApiKey] = useState('');
  const [proxyUrl, setProxyUrl] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  // Initialize form values from store
  useEffect(() => {
    if (providerData?.keyVaults) {
      setApiKey(providerData.keyVaults.apiKey || '');
      setProxyUrl(providerData.keyVaults.baseURL || '');
    }
    // Response API state will be handled separately
  }, [providerData]);

  // Update function for onBlur events
  const updateField = useCallback(
    async (field: string, value: string) => {
      setIsUpdating(true);
      try {
        const updateData = {
          keyVaults: {
            ...providerData?.keyVaults,
            [field]: value,
          },
        };

        await updateAiProviderConfig(provider.id, updateData);
        console.log(`Updated ${field} for provider ${provider.id}`);
      } catch (error) {
        console.error(`Failed to update ${field}:`, error);
        Alert.alert(
          t('aiProviders.configuration.updateFailedTitle', { ns: 'setting' }),
          t('aiProviders.configuration.updateFailedDesc', { ns: 'setting' }),
        );
      } finally {
        setIsUpdating(false);
      }
    },
    [providerData?.keyVaults, provider.id, updateAiProviderConfig, t],
  );

  const handleApiKeyChange = useCallback((value: string) => {
    setApiKey(value);
  }, []);

  const handleApiKeyBlur = useCallback(() => {
    updateField('apiKey', apiKey);
  }, [updateField, apiKey]);

  const handleProxyUrlChange = useCallback((value: string) => {
    setProxyUrl(value);
  }, []);

  const handleProxyUrlBlur = useCallback(() => {
    // Simple URL validation
    if (proxyUrl && !/^https?:\/\/.+/.test(proxyUrl)) {
      // Don't update invalid URLs
      return;
    }

    updateField('baseURL', proxyUrl);
  }, [updateField, proxyUrl]);

  // 从 provider.settings 中获取配置
  const {
    showApiKey: shouldShowApiKey = true,
    proxyUrl: proxyUrlConfig,
    showChecker = true,
  } = provider.settings || {};

  const showProxyUrl = proxyUrlConfig || provider.source === 'custom';

  // RN 端假设总是服务器模式
  const isServerMode = true;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>
        {t('aiProviders.configuration.title', { ns: 'setting' })}
      </Text>

      {/* API Key Field */}
      {shouldShowApiKey && (
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>
            {t('aiProviders.configuration.apiKey.label', { ns: 'setting' })}
          </Text>
          <Text style={styles.inputDescription}>
            {t('aiProviders.configuration.apiKey.description', {
              name: provider.name || provider.id,
              ns: 'setting',
            })}
          </Text>
          <Input.Password
            autoCapitalize="none"
            autoComplete="off"
            autoCorrect={false}
            editable={!isChecking}
            onBlur={handleApiKeyBlur}
            onChangeText={handleApiKeyChange}
            placeholder={t('aiProviders.configuration.apiKey.placeholder', {
              name: provider.name || provider.id,
              ns: 'setting',
            })}
            size="large"
            style={[styles.textInput, isChecking && styles.textInputDisabled]}
            value={apiKey}
            variant="outlined"
          />
        </View>
      )}

      {/* API Proxy URL Field */}
      {showProxyUrl && (
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>
            {(proxyUrlConfig && typeof proxyUrlConfig === 'object' && proxyUrlConfig.title) ||
              t('aiProviders.configuration.proxyUrl.title', { ns: 'setting' })}
          </Text>
          <Text style={styles.inputDescription}>
            {(proxyUrlConfig && typeof proxyUrlConfig === 'object' && proxyUrlConfig.desc) ||
              t('aiProviders.configuration.proxyUrl.desc', { ns: 'setting' })}
          </Text>
          <View style={[!isValidUrl(proxyUrl) && styles.inputContainerError]}>
            <Input
              autoCapitalize="none"
              autoComplete="off"
              autoCorrect={false}
              editable={!isChecking}
              keyboardType="url"
              onBlur={handleProxyUrlBlur}
              onChangeText={handleProxyUrlChange}
              placeholder={
                (proxyUrlConfig &&
                  typeof proxyUrlConfig === 'object' &&
                  proxyUrlConfig.placeholder) ||
                t('aiProviders.configuration.proxyUrl.placeholder', { ns: 'setting' })
              }
              size="large"
              style={[styles.textInput, isChecking && styles.textInputDisabled]}
              value={proxyUrl}
            />
            {isChecking && (
              <View style={styles.loadingIndicator}>
                <ActivityIndicator color={theme.colorTextSecondary} size="small" />
              </View>
            )}
          </View>
          {!isValidUrl(proxyUrl) && (
            <Text style={styles.errorText}>
              {t('aiProviders.configuration.proxyUrl.invalid', { ns: 'setting' })}
            </Text>
          )}
        </View>
      )}

      {/* Connectivity Checker */}
      {showChecker && (
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>{t('providerModels.config.checker.title')}</Text>
          <Text style={styles.inputDescription}>{t('providerModels.config.checker.desc')}</Text>
          <Checker
            model={provider.checkModel!}
            onAfterCheck={async () => {
              setIsChecking(false);
            }}
            onBeforeCheck={async () => {
              setIsChecking(true);
              // 连接检查前保存当前配置
              await updateAiProviderConfig(provider.id, {
                keyVaults: {
                  apiKey,
                  baseURL: proxyUrl,
                },
              });
            }}
            provider={provider.id}
          />
        </View>
      )}

      {/* AES-GCM Encryption Notice */}
      {isServerMode && (
        <View style={styles.aesGcmContainer}>
          <View style={styles.aesGcmContent}>
            <Lock color={theme.colorTextQuaternary} size={theme.fontSize} />
            <Text style={styles.aesGcmText}>
              <Trans i18nKey="providerModels.config.aesGcm" ns="setting">
                您的秘钥与代理地址等将使用
                <Text onPress={() => Linking.openURL(AES_GCM_URL)} style={styles.aesGcmLink}>
                  AES-GCM
                </Text>
                算法进行加密
              </Trans>
            </Text>
          </View>
        </View>
      )}

      {/* Update status indicator */}
      {isUpdating && (
        <Text style={styles.updatingIndicator}>
          {t('aiProviders.configuration.saving', { ns: 'setting' })}
        </Text>
      )}
    </View>
  );
});

export default ConfigurationSection;
