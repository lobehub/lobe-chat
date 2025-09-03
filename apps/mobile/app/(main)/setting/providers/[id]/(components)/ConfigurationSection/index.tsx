import React, { useState, useCallback, useEffect, memo, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Linking } from 'react-native';
import { Eye, EyeOff, Lock } from 'lucide-react-native';
import { useDebounceFn } from 'ahooks';
import { useTranslation, Trans } from 'react-i18next';

import { useThemeToken } from '@/theme';
import { AiProviderDetailItem } from '@/types/aiProvider';
import { useAiInfraStore } from '@/store/aiInfra';
import { AES_GCM_URL } from '@/const/url';

import { useStyles } from './style';
import Checker from './Checker';

interface ConfigurationSectionProps {
  provider: AiProviderDetailItem;
}

const isValidUrl = (url: string) => {
  return !url || url.match(/^https?:\/\/.+/);
};

const ConfigurationSection = memo<ConfigurationSectionProps>(({ provider }) => {
  const { styles } = useStyles();
  const token = useThemeToken();
  const { t } = useTranslation('setting');

  // Store hooks
  const { useFetchAiProviderItem, updateAiProviderConfig } = useAiInfraStore();
  const { data: providerData } = useFetchAiProviderItem(provider.id);

  // Form state
  const [apiKey, setApiKey] = useState('');
  const [proxyUrl, setProxyUrl] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  // 标记是否正在进行连接测试
  const isCheckingConnection = useRef(false);

  // Initialize form values from store
  useEffect(() => {
    if (providerData?.keyVaults) {
      setApiKey(providerData.keyVaults.apiKey || '');
      setProxyUrl(providerData.keyVaults.baseURL || '');
    }
    // Response API state will be handled separately
  }, [providerData]);

  // Debounced update function
  const { run: debouncedUpdate } = useDebounceFn(
    async (field: string, value: string) => {
      // 测试链接时已经触发一次了 updateAiProviderConfig，不应该重复更新
      if (isCheckingConnection.current) return;

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
    { wait: 500 },
  );

  const handleApiKeyChange = useCallback(
    (value: string) => {
      setApiKey(value);
      debouncedUpdate('apiKey', value);
    },
    [debouncedUpdate],
  );

  const handleProxyUrlChange = useCallback(
    (value: string) => {
      setProxyUrl(value);

      // Simple URL validation
      if (value && !/^https?:\/\/.+/.test(value)) {
        // Don't update invalid URLs, but still update the local state
        return;
      }

      debouncedUpdate('baseURL', value);
    },
    [debouncedUpdate],
  );

  const toggleApiKeyVisibility = () => {
    setShowApiKey(!showApiKey);
  };

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
          <View style={styles.inputContainer}>
            <TextInput
              autoCapitalize="none"
              autoComplete="off"
              autoCorrect={false}
              editable={!isChecking}
              onChangeText={handleApiKeyChange}
              placeholder={t('aiProviders.configuration.apiKey.placeholder', {
                name: provider.name || provider.id,
                ns: 'setting',
              })}
              placeholderTextColor={token.colorTextTertiary}
              secureTextEntry={!showApiKey}
              style={[styles.textInput, isChecking && styles.textInputDisabled]}
              value={apiKey}
            />
            <TouchableOpacity
              disabled={isChecking}
              onPress={toggleApiKeyVisibility}
              style={styles.eyeButton}
            >
              {showApiKey ? (
                <EyeOff
                  color={isChecking ? token.colorTextDisabled : token.colorTextSecondary}
                  size={18}
                />
              ) : (
                <Eye
                  color={isChecking ? token.colorTextDisabled : token.colorTextSecondary}
                  size={18}
                />
              )}
            </TouchableOpacity>
          </View>
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
          <View
            style={[styles.inputContainer, !isValidUrl(proxyUrl) && styles.inputContainerError]}
          >
            <TextInput
              autoCapitalize="none"
              autoComplete="off"
              autoCorrect={false}
              editable={!isChecking}
              keyboardType="url"
              onChangeText={handleProxyUrlChange}
              placeholder={
                (proxyUrlConfig &&
                  typeof proxyUrlConfig === 'object' &&
                  proxyUrlConfig.placeholder) ||
                t('aiProviders.configuration.proxyUrl.placeholder', { ns: 'setting' })
              }
              placeholderTextColor={token.colorTextTertiary}
              style={[styles.textInput, isChecking && styles.textInputDisabled]}
              value={proxyUrl}
            />
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
              // 重置连接测试状态，允许后续的 debouncedUpdate 更新
              isCheckingConnection.current = false;
              setIsChecking(false);
            }}
            onBeforeCheck={async () => {
              // 设置连接测试状态，阻止 debouncedUpdate 的重复请求
              isCheckingConnection.current = true;
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
            <Lock color={token.colorTextSecondary} size={14} style={{ opacity: 0.66 }} />
            <Text style={styles.aesGcmText}>
              <Trans i18nKey="providerModels.config.aesGcm" ns="setting">
                您的秘钥与代理地址等将使用
                <Text onPress={() => Linking.openURL(AES_GCM_URL)} style={styles.aesGcmLink}>
                  AES-GCM
                </Text>
                加密算法进行加密
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
