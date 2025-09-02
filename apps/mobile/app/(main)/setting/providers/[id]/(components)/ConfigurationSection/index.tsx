import React, { useState, useCallback, useEffect, memo } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { useDebounceFn } from 'ahooks';
import { useTranslation } from 'react-i18next';

import { useThemeToken } from '@/theme';
import { AiProviderDetailItem } from '@/types/aiProvider';
import { useAiInfraStore } from '@/store/aiInfra';

import { useStyles } from './style';

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

  // Initialize form values from store
  useEffect(() => {
    if (providerData?.keyVaults) {
      setApiKey(providerData.keyVaults.apiKey || '');
      setProxyUrl(providerData.keyVaults.baseURL || '');
    }
  }, [providerData]);

  // Debounced update function
  const { run: debouncedUpdate } = useDebounceFn(
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

  const proxyUrlConfig = provider.settings?.proxyUrl;
  const showProxyUrl = proxyUrlConfig || provider.source === 'custom';

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>
        {t('aiProviders.configuration.title', { ns: 'setting' })}
      </Text>

      {/* API Key Field */}
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
            onChangeText={handleApiKeyChange}
            placeholder={t('aiProviders.configuration.apiKey.placeholder', {
              name: provider.name || provider.id,
              ns: 'setting',
            })}
            placeholderTextColor={token.colorTextTertiary}
            secureTextEntry={!showApiKey}
            style={styles.textInput}
            value={apiKey}
          />
          <TouchableOpacity onPress={toggleApiKeyVisibility} style={styles.eyeButton}>
            {showApiKey ? (
              <EyeOff color={token.colorTextSecondary} size={18} />
            ) : (
              <Eye color={token.colorTextSecondary} size={18} />
            )}
          </TouchableOpacity>
        </View>
      </View>

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
              keyboardType="url"
              onChangeText={handleProxyUrlChange}
              placeholder={
                (proxyUrlConfig &&
                  typeof proxyUrlConfig === 'object' &&
                  proxyUrlConfig.placeholder) ||
                t('aiProviders.configuration.proxyUrl.placeholder', { ns: 'setting' })
              }
              placeholderTextColor={token.colorTextTertiary}
              style={styles.textInput}
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
