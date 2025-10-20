import { AiProviderDetailItem } from '@lobechat/types';
import { Cell, Center, Flexbox, Form, Icon, Input, Text, useTheme } from '@lobehub/ui-rn';
import { Lock } from 'lucide-react-native';
import { memo, useCallback, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, Linking } from 'react-native';

import { AES_GCM_URL } from '@/_const/url';
import { useAiInfraStore } from '@/store/aiInfra';

import Checker from './Checker';

interface ConfigurationSectionProps {
  provider: AiProviderDetailItem;
  setLoading: (loading: boolean) => void;
}

const isValidUrl = (url: string) => {
  return !url || url.match(/^https?:\/\/.+/);
};

const ConfigurationSection = memo<ConfigurationSectionProps>(({ provider, setLoading }) => {
  const theme = useTheme();
  const isLobehub = provider.id === 'lobehub' || (provider as any)?.data?.id === 'lobehub';
  const { t } = useTranslation('setting');

  // Store hooks
  const { useFetchAiProviderItem, updateAiProviderConfig } = useAiInfraStore();
  const { data: providerData } = useFetchAiProviderItem(provider.id);

  // Form state
  const [form] = Form.useForm();
  const [isChecking, setIsChecking] = useState(false);

  const initialValues = useMemo(
    () => ({
      apiKey: providerData?.keyVaults?.apiKey || '',
      proxyUrl: providerData?.keyVaults?.baseURL || '',
    }),
    [providerData?.keyVaults?.apiKey, providerData?.keyVaults?.baseURL],
  );

  // Update function for onBlur events
  const updateField = useCallback(
    async (field: 'apiKey' | 'baseURL', value: string) => {
      setLoading(true);
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
        setLoading(false);
      }
    },
    [providerData?.keyVaults, provider.id, updateAiProviderConfig, t],
  );

  const handleApiKeyBlur = useCallback(() => {
    const value = (form.getFieldValue('apiKey') as string | undefined) ?? '';
    void updateField('apiKey', value);
  }, [form, updateField]);

  const handleProxyUrlBlur = useCallback(() => {
    const rawValue = (form.getFieldValue('proxyUrl') as string | undefined) ?? '';
    const trimmedValue = rawValue.trim();

    if (rawValue !== trimmedValue) {
      void form.setFieldValue('proxyUrl', trimmedValue, { markTouched: true, validate: false });
    }

    if (trimmedValue && !isValidUrl(trimmedValue)) return;

    void updateField('baseURL', trimmedValue);
  }, [form, updateField]);

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
    <Flexbox gap={8} paddingInline={16}>
      <Form form={form} initialValues={initialValues}>
        {/* API Key Field */}
        {!isLobehub && shouldShowApiKey && (
          <Flexbox>
            <Cell
              description={t('aiProviders.configuration.apiKey.description', {
                name: provider.name || provider.id,
                ns: 'setting',
              })}
              paddingInline={0}
              showArrow={false}
              title={t('aiProviders.configuration.apiKey.label', { ns: 'setting' })}
            />
            <Form.Item name="apiKey" style={{ marginBottom: 0 }}>
              <Input.Password
                autoCapitalize="none"
                autoComplete="off"
                autoCorrect={false}
                disabled={isChecking}
                onBlur={handleApiKeyBlur}
                placeholder={t('aiProviders.configuration.apiKey.placeholder', {
                  name: provider.name || provider.id,
                  ns: 'setting',
                })}
                variant="outlined"
              />
            </Form.Item>
          </Flexbox>
        )}

        {/* API Proxy URL Field */}
        {!isLobehub && showProxyUrl && (
          <Flexbox>
            <Cell
              description={
                (proxyUrlConfig && typeof proxyUrlConfig === 'object' && proxyUrlConfig.desc) ||
                t('aiProviders.configuration.proxyUrl.desc', { ns: 'setting' })
              }
              paddingInline={0}
              showArrow={false}
              title={
                (proxyUrlConfig && typeof proxyUrlConfig === 'object' && proxyUrlConfig.title) ||
                t('aiProviders.configuration.proxyUrl.title', { ns: 'setting' })
              }
            />
            <Form.Item
              name="proxyUrl"
              rules={[
                {
                  validator: (value) => {
                    const input = (value as string | undefined)?.trim() ?? '';
                    if (!isValidUrl(input)) {
                      return t('aiProviders.configuration.proxyUrl.invalid', { ns: 'setting' });
                    }
                  },
                },
              ]}
              style={{ marginBottom: 0 }}
              validateTrigger={['onChangeText', 'onBlur']}
            >
              <Input
                autoCapitalize="none"
                autoComplete="off"
                autoCorrect={false}
                disabled={isChecking}
                keyboardType="url"
                onBlur={handleProxyUrlBlur}
                placeholder={
                  (proxyUrlConfig &&
                    typeof proxyUrlConfig === 'object' &&
                    proxyUrlConfig.placeholder) ||
                  t('aiProviders.configuration.proxyUrl.placeholder', { ns: 'setting' })
                }
                suffix={
                  isChecking && <ActivityIndicator color={theme.colorTextSecondary} size="small" />
                }
              />
            </Form.Item>
          </Flexbox>
        )}
      </Form>

      {/* Connectivity Checker */}
      {showChecker && (
        <Flexbox>
          <Cell
            description={t('providerModels.config.checker.desc')}
            paddingInline={0}
            showArrow={false}
            title={t('providerModels.config.checker.title')}
          />
          <Checker
            model={provider.checkModel!}
            onAfterCheck={async () => {
              setIsChecking(false);
            }}
            onBeforeCheck={async () => {
              setIsChecking(true);
              // 连接检查前保存当前配置
              const { apiKey: apiKeyValue, proxyUrl: proxyUrlValue } = form.getFieldsValue();

              await updateAiProviderConfig(provider.id, {
                keyVaults: {
                  apiKey: (apiKeyValue as string | undefined) ?? '',
                  baseURL: ((proxyUrlValue as string | undefined) ?? '').trim(),
                },
              });
            }}
            provider={provider.id}
          />
        </Flexbox>
      )}

      {/* AES-GCM Encryption Notice */}
      {!isLobehub && isServerMode && (
        <Center gap={6} horizontal paddingBlock={16}>
          <Icon color={theme.colorTextDescription} icon={Lock} size={14} />
          <Text type={'secondary'}>
            <Trans i18nKey="providerModels.config.aesGcm" ns="setting">
              您的秘钥与代理地址等将使用
              <Text onPress={() => Linking.openURL(AES_GCM_URL)} type={'info'}>
                AES-GCM
              </Text>
              算法进行加密
            </Trans>
          </Text>
        </Center>
      )}
    </Flexbox>
  );
});

export default ConfigurationSection;
