'use client';

import { ComfyUI } from '@lobehub/icons';
import { Button, Icon, Select } from '@lobehub/ui';
import { useTheme } from 'antd-style';
import { Loader2Icon, Network } from 'lucide-react';
import Image from 'next/image';
import { memo, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Center, Flexbox } from 'react-layout-kit';

import { FormInput, FormPassword } from '@/components/FormInput';
import KeyValueEditor from '@/components/KeyValueEditor';
import { ErrorActionContainer, FormAction } from '@/features/Conversation/Error/style';
import { useAiInfraStore } from '@/store/aiInfra';
import { ComfyUIKeyVault } from '@/types/user/settings';

interface ComfyUIAuthProps {
  onClose?: () => void;
  onRecreate?: () => void;
}

const ComfyUIAuth = memo<ComfyUIAuthProps>(({ onClose, onRecreate }) => {
  const { t } = useTranslation('error');
  const { t: s } = useTranslation('modelProvider');
  const theme = useTheme();

  // Use aiInfraStore for updating config (same as settings page)
  const updateAiProviderConfig = useAiInfraStore((s) => s.updateAiProviderConfig);
  const useFetchAiProviderRuntimeState = useAiInfraStore((s) => s.useFetchAiProviderRuntimeState);

  // Fetch the runtime state to ensure config is loaded
  // Pass true to force fetching from server (since we need user's configuration)
  useFetchAiProviderRuntimeState(true);

  // Get ComfyUI config from aiInfraStore (same as settings page)
  const comfyUIConfig = useAiInfraStore(
    (s) => s.aiProviderRuntimeConfig?.['comfyui']?.keyVaults,
  ) as ComfyUIKeyVault | undefined;

  // State for showing base URL input - initially hidden
  const [showBaseURL, setShowBaseURL] = useState(false);
  const [loading, setLoading] = useState(false);

  // State management for form values - initialize without config first
  const [formValues, setFormValues] = useState({
    apiKey: '',
    authType: 'none' as string,
    baseURL: 'http://localhost:8188',
    customHeaders: {} as Record<string, string>,
    password: '',
    username: '',
  });

  // Update form values when comfyUIConfig changes (配置反读)
  // Use individual primitive values to avoid infinite re-renders
  useEffect(() => {
    if (comfyUIConfig) {
      const newValues = {
        apiKey: comfyUIConfig.apiKey || '',
        authType: comfyUIConfig.authType || 'none',
        baseURL: comfyUIConfig.baseURL || 'http://localhost:8188',
        customHeaders: comfyUIConfig.customHeaders || {},
        password: comfyUIConfig.password || '',
        username: comfyUIConfig.username || '',
      };
      setFormValues(newValues);
    }
  }, [
    comfyUIConfig?.apiKey,
    comfyUIConfig?.authType,
    comfyUIConfig?.baseURL,
    comfyUIConfig?.password,
    comfyUIConfig?.username,
    JSON.stringify(comfyUIConfig?.customHeaders),
  ]);

  const authTypeOptions = [
    { label: s('comfyui.authType.options.none'), value: 'none' },
    { label: s('comfyui.authType.options.basic'), value: 'basic' },
    { label: s('comfyui.authType.options.bearer'), value: 'bearer' },
    { label: s('comfyui.authType.options.custom'), value: 'custom' },
  ];

  const handleValueChange = (field: string, value: any) => {
    setFormValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      // Basic validation
      if (!formValues.baseURL) {
        return;
      }

      if (formValues.authType === 'basic' && (!formValues.username || !formValues.password)) {
        return;
      }

      if (formValues.authType === 'bearer' && !formValues.apiKey) {
        return;
      }

      if (
        formValues.authType === 'custom' &&
        (!formValues.customHeaders || Object.keys(formValues.customHeaders).length === 0)
      ) {
        return;
      }

      // Update provider config using aiInfraStore
      await updateAiProviderConfig('comfyui', {
        keyVaults: formValues,
      });

      // Refresh the runtime state after saving
      await useAiInfraStore.getState().refreshAiProviderRuntimeState();

      // Recreate the image generation
      if (onRecreate) {
        onRecreate();
      }
    } catch (error) {
      console.error('Failed to save ComfyUI config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <ErrorActionContainer>
      <Center gap={16} paddingBlock={32} style={{ width: '100%' }}>
        <ComfyUI.Combine size={64} type={'color'} />
        <FormAction
          avatar={<Image alt="LobeHub" height={42} src="/favicon.ico" width={42} />}
          description={t('unlock.comfyui.description', { name: 'ComfyUI' })}
          title={t('unlock.comfyui.title', { name: 'ComfyUI' })}
        >
          <Flexbox gap={16} width="100%">
            {/* Base URL */}
            {showBaseURL ? (
              <Flexbox gap={4}>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{s('comfyui.baseURL.title')}</div>
                <FormInput
                  onChange={(value) => handleValueChange('baseURL', value)}
                  placeholder={s('comfyui.baseURL.placeholder')}
                  suffix={<div>{loading && <Icon icon={Loader2Icon} spin />}</div>}
                  value={formValues.baseURL}
                />
              </Flexbox>
            ) : (
              <Button
                icon={<Icon icon={Network} />}
                onClick={() => setShowBaseURL(true)}
                type={'text'}
              >
                {t('unlock.comfyui.modifyBaseUrl')}
              </Button>
            )}

            {/* Auth Type */}
            <Flexbox gap={4}>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{s('comfyui.authType.title')}</div>
              <Select
                allowClear={false}
                onChange={(value) => handleValueChange('authType', value)}
                options={authTypeOptions}
                placeholder={s('comfyui.authType.placeholder')}
                value={formValues.authType}
              />
            </Flexbox>

            {/* Basic Auth Fields */}
            {formValues.authType === 'basic' && (
              <>
                <Flexbox gap={4}>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{s('comfyui.username.title')}</div>
                  <FormInput
                    autoComplete="username"
                    onChange={(value) => handleValueChange('username', value)}
                    placeholder={s('comfyui.username.placeholder')}
                    suffix={<div>{loading && <Icon icon={Loader2Icon} spin />}</div>}
                    value={formValues.username}
                  />
                </Flexbox>
                <Flexbox gap={4}>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{s('comfyui.password.title')}</div>
                  <FormPassword
                    autoComplete="new-password"
                    onChange={(value) => handleValueChange('password', value)}
                    placeholder={s('comfyui.password.placeholder')}
                    suffix={<div>{loading && <Icon icon={Loader2Icon} spin />}</div>}
                    value={formValues.password}
                  />
                </Flexbox>
              </>
            )}

            {/* Bearer Token Field */}
            {formValues.authType === 'bearer' && (
              <Flexbox gap={4}>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{s('comfyui.apiKey.title')}</div>
                <FormPassword
                  autoComplete="new-password"
                  onChange={(value) => handleValueChange('apiKey', value)}
                  placeholder={s('comfyui.apiKey.placeholder')}
                  suffix={<div>{loading && <Icon icon={Loader2Icon} spin />}</div>}
                  value={formValues.apiKey}
                />
              </Flexbox>
            )}

            {/* Custom Headers Field */}
            {formValues.authType === 'custom' && (
              <Flexbox gap={4}>
                <div style={{ fontSize: 14, fontWeight: 500 }}>
                  {s('comfyui.customHeaders.title')}
                </div>
                <div style={{ color: theme.colorTextSecondary, fontSize: 12, marginBottom: 4 }}>
                  {s('comfyui.customHeaders.desc')}
                </div>
                <KeyValueEditor
                  addButtonText={s('comfyui.customHeaders.addButton')}
                  deleteTooltip={s('comfyui.customHeaders.deleteTooltip')}
                  duplicateKeyErrorText={s('comfyui.customHeaders.duplicateKeyError')}
                  keyPlaceholder={s('comfyui.customHeaders.keyPlaceholder')}
                  onChange={(value) => handleValueChange('customHeaders', value)}
                  value={formValues.customHeaders}
                  valuePlaceholder={s('comfyui.customHeaders.valuePlaceholder')}
                />
              </Flexbox>
            )}
          </Flexbox>
        </FormAction>
        <Flexbox gap={12} style={{ maxWidth: 300 }} width={'100%'}>
          <Button block onClick={handleSave} style={{ marginTop: 8 }} type={'primary'}>
            {t('unlock.confirm')}
          </Button>
          <Button onClick={handleClose}>{t('unlock.closeMessage')}</Button>
        </Flexbox>
      </Center>
    </ErrorActionContainer>
  );
});

export default ComfyUIAuth;
