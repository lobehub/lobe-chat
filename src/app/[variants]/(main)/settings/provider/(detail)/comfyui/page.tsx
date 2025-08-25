'use client';

import { Select } from '@lobehub/ui';
import { useTranslation } from 'react-i18next';

import { FormInput, FormPassword } from '@/components/FormInput';
import KeyValueEditor from '@/components/KeyValueEditor';
import { ComfyUIProviderCard } from '@/config/modelProviders';
import { aiProviderSelectors, useAiInfraStore } from '@/store/aiInfra';
import { GlobalLLMProviderKey } from '@/types/user/settings';

import { KeyVaultsConfigKey } from '../../const';
import { SkeletonInput } from '../../features/ProviderConfig';
import { ProviderItem } from '../../type';
import ProviderDetail from '../[id]';

const providerKey: GlobalLLMProviderKey = 'comfyui';

const useComfyUICard = (): ProviderItem => {
  const { t } = useTranslation('modelProvider');

  const isLoading = useAiInfraStore(aiProviderSelectors.isAiProviderConfigLoading(providerKey));

  // Get current config and watch for auth type changes
  const config = useAiInfraStore((s) => s.aiProviderRuntimeConfig?.[providerKey]);
  const authType = config?.keyVaults?.authType || 'none';

  const authTypeOptions = [
    { label: t('comfyui.authType.options.none' as any), value: 'none' },
    { label: t('comfyui.authType.options.basic' as any), value: 'basic' },
    { label: t('comfyui.authType.options.bearer' as any), value: 'bearer' },
    { label: t('comfyui.authType.options.custom' as any), value: 'custom' },
  ];

  const apiKeyItems = [
    // Base URL - Always shown
    {
      children: isLoading ? (
        <SkeletonInput />
      ) : (
        <FormInput placeholder={t('comfyui.baseURL.placeholder' as any)} />
      ),
      desc: t('comfyui.baseURL.desc' as any),
      label: t('comfyui.baseURL.title' as any),
      name: [KeyVaultsConfigKey, 'baseURL'],
    },

    // Authentication Type Selector - Always shown
    {
      children: isLoading ? (
        <SkeletonInput />
      ) : (
        <Select
          allowClear={false}
          options={authTypeOptions}
          placeholder={t('comfyui.authType.placeholder' as any)}
        />
      ),
      desc: t('comfyui.authType.desc' as any),
      label: t('comfyui.authType.title' as any),
      name: [KeyVaultsConfigKey, 'authType'],
    },
  ];

  // Conditionally add fields based on auth type
  if (authType === 'basic') {
    apiKeyItems.push(
      {
        children: isLoading ? (
          <SkeletonInput />
        ) : (
          <FormInput
            autoComplete="username"
            placeholder={t('comfyui.username.placeholder' as any)}
          />
        ),
        desc: t('comfyui.username.desc' as any),
        label: t('comfyui.username.title' as any),
        name: [KeyVaultsConfigKey, 'username'],
      },
      {
        children: isLoading ? (
          <SkeletonInput />
        ) : (
          <FormPassword
            autoComplete="new-password"
            placeholder={t('comfyui.password.placeholder' as any)}
          />
        ),
        desc: t('comfyui.password.desc' as any),
        label: t('comfyui.password.title' as any),
        name: [KeyVaultsConfigKey, 'password'],
      },
    );
  }

  if (authType === 'bearer') {
    apiKeyItems.push({
      children: isLoading ? (
        <SkeletonInput />
      ) : (
        <FormPassword
          autoComplete="new-password"
          placeholder={t('comfyui.apiKey.placeholder' as any)}
        />
      ),
      desc: t('comfyui.apiKey.desc' as any),
      label: t('comfyui.apiKey.title' as any),
      name: [KeyVaultsConfigKey, 'apiKey'],
    });
  }

  if (authType === 'custom') {
    apiKeyItems.push({
      children: isLoading ? (
        <SkeletonInput />
      ) : (
        <KeyValueEditor
          addButtonText={t('comfyui.customHeaders.addButton' as any)}
          deleteTooltip={t('comfyui.customHeaders.deleteTooltip' as any)}
          duplicateKeyErrorText={t('comfyui.customHeaders.duplicateKeyError' as any)}
          keyPlaceholder={t('comfyui.customHeaders.keyPlaceholder' as any)}
          valuePlaceholder={t('comfyui.customHeaders.valuePlaceholder' as any)}
        />
      ),
      desc: t('comfyui.customHeaders.desc' as any),
      label: t('comfyui.customHeaders.title' as any),
      name: [KeyVaultsConfigKey, 'customHeaders'],
    });
  }

  return {
    ...ComfyUIProviderCard,
    apiKeyItems,
  };
};

const Page = () => {
  const card = useComfyUICard();

  return <ProviderDetail {...card} />;
};

export default Page;
