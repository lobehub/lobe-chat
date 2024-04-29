import { Form, type FormItemProps, type ItemGroup } from '@lobehub/ui';
import { Form as AntForm, Input, Switch } from 'antd';
import { debounce } from 'lodash-es';
import { ReactNode, memo } from 'react';
import { useTranslation } from 'react-i18next';

import { useSyncSettings } from '@/app/(main)/settings/hooks/useSyncSettings';
import {
  LLMProviderApiTokenKey,
  LLMProviderBaseUrlKey,
  LLMProviderConfigKey,
  LLMProviderModelListKey,
} from '@/app/(main)/settings/llm/const';
import { FORM_STYLE } from '@/const/layoutTokens';
import { useUserStore } from '@/store/user';
import { modelConfigSelectors } from '@/store/user/selectors';
import { GlobalLLMProviderKey } from '@/types/settings';

import Checker from '../Checker';
import ProviderModelListSelect from '../ProviderModelList';

interface ProviderConfigProps {
  apiKeyItems?: FormItemProps[];
  canDeactivate?: boolean;
  checkModel?: string;
  checkerItem?: FormItemProps;
  modelList?: {
    azureDeployName?: boolean;
    notFoundContent?: ReactNode;
    placeholder?: string;
    showModelFetcher?: boolean;
  };
  provider: GlobalLLMProviderKey;
  showApiKey?: boolean;
  showBrowserRequest?: boolean;
  showEndpoint?: boolean;
  title: ReactNode;
}

const ProviderConfig = memo<ProviderConfigProps>(
  ({
    apiKeyItems,
    provider,
    showEndpoint,
    showApiKey = true,
    checkModel,
    canDeactivate = true,
    title,
    checkerItem,
    modelList,
    showBrowserRequest,
  }) => {
    const { t } = useTranslation('setting');
    const { t: modelT } = useTranslation('modelProvider');
    const [form] = AntForm.useForm();
    const [
      toggleProviderEnabled,
      setSettings,
      enabled,
      isFetchOnClient,
      isProviderEndpointNotEmpty,
    ] = useUserStore((s) => [
      s.toggleProviderEnabled,
      s.setSettings,
      modelConfigSelectors.isProviderEnabled(provider)(s),
      modelConfigSelectors.isProviderFetchOnClient(provider)(s),
      modelConfigSelectors.isProviderEndpointNotEmpty(provider)(s),
    ]);

    useSyncSettings(form);

    const apiKeyItem: FormItemProps[] = !showApiKey
      ? []
      : apiKeyItems ?? [
          {
            children: (
              <Input.Password
                autoComplete={'new-password'}
                placeholder={modelT(`${provider}.token.placeholder` as any)}
              />
            ),
            desc: modelT(`${provider}.token.desc` as any),
            label: modelT(`${provider}.token.title` as any),
            name: [LLMProviderConfigKey, provider, LLMProviderApiTokenKey],
          },
        ];

    const formItems = [
      ...apiKeyItem,
      showEndpoint && {
        children: (
          <Input allowClear placeholder={modelT(`${provider}.endpoint.placeholder` as any)} />
        ),
        desc: modelT(`${provider}.endpoint.desc` as any),
        label: modelT(`${provider}.endpoint.title` as any),
        name: [LLMProviderConfigKey, provider, LLMProviderBaseUrlKey],
      },
      (showBrowserRequest || (showEndpoint && isProviderEndpointNotEmpty)) && {
        children: (
          <Switch
            onChange={(enabled) => {
              setSettings({ [LLMProviderConfigKey]: { [provider]: { fetchOnClient: enabled } } });
            }}
            value={isFetchOnClient}
          />
        ),
        desc: t('llm.fetchOnClient.desc'),
        label: t('llm.fetchOnClient.title'),
        minWidth: undefined,
      },
      {
        children: (
          <ProviderModelListSelect
            notFoundContent={modelList?.notFoundContent}
            placeholder={modelList?.placeholder ?? t('llm.modelList.placeholder')}
            provider={provider}
            showAzureDeployName={modelList?.azureDeployName}
            showModelFetcher={modelList?.showModelFetcher}
          />
        ),
        desc: t('llm.modelList.desc'),
        label: t('llm.modelList.title'),
        name: [LLMProviderConfigKey, provider, LLMProviderModelListKey],
      },
      checkerItem ?? {
        children: <Checker model={checkModel!} provider={provider} />,
        desc: t('llm.checker.desc'),
        label: t('llm.checker.title'),
        minWidth: undefined,
      },
    ].filter(Boolean) as FormItemProps[];

    const model: ItemGroup = {
      children: formItems,

      defaultActive: canDeactivate ? enabled : undefined,
      extra: canDeactivate ? (
        <Switch
          onChange={(enabled) => {
            toggleProviderEnabled(provider, enabled);
          }}
          value={enabled}
        />
      ) : undefined,
      title,
    };

    return (
      <Form
        form={form}
        items={[model]}
        onValuesChange={debounce(setSettings, 100)}
        {...FORM_STYLE}
        itemMinWidth={'max(50%,400px)'}
      />
    );
  },
);

export default ProviderConfig;
