'use client';

import { Form, type FormItemProps, type ItemGroup } from '@lobehub/ui';
import { Input, Switch } from 'antd';
import { createStyles } from 'antd-style';
import { debounce } from 'lodash-es';
import { ReactNode, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useSyncSettings } from '@/app/(main)/settings/hooks/useSyncSettings';
import {
  KeyVaultsConfigKey,
  LLMProviderApiTokenKey,
  LLMProviderBaseUrlKey,
  LLMProviderConfigKey,
  LLMProviderModelListKey,
} from '@/app/(main)/settings/llm/const';
import { FORM_STYLE } from '@/const/layoutTokens';
import { useUserStore } from '@/store/user';
import { keyVaultsConfigSelectors, modelConfigSelectors } from '@/store/user/selectors';
import { ModelProviderCard } from '@/types/llm';
import { GlobalLLMProviderKey } from '@/types/user/settings';

import Checker from '../Checker';
import ProviderModelListSelect from '../ProviderModelList';

const useStyles = createStyles(({ css, prefixCls, responsive }) => ({
  form: css`
    .${prefixCls}-form-item-control:has(.${prefixCls}-input,.${prefixCls}-select) {
      flex: none;
      width: min(70%, 800px);
      min-width: min(70%, 800px) !important;
    }
    ${responsive.mobile} {
      width: 100%;
      min-width: unset !important;
    }
    .${prefixCls}-select-selection-overflow-item {
      font-size: 12px;
    }
  `,
  safariIconWidthFix: css`
    svg {
      width: unset !important;
    }
  `,
}));

export interface ProviderConfigProps extends Omit<ModelProviderCard, 'id'> {
  apiKeyItems?: FormItemProps[];
  canDeactivate?: boolean;
  checkerItem?: FormItemProps;
  className?: string;
  hideSwitch?: boolean;
  id: GlobalLLMProviderKey;
  modelList?: {
    azureDeployName?: boolean;
    notFoundContent?: ReactNode;
    placeholder?: string;
    showModelFetcher?: boolean;
  };
  title: ReactNode;
}

const ProviderConfig = memo<ProviderConfigProps>(
  ({
    apiKeyItems,
    id,
    proxyUrl,
    showApiKey = true,
    checkModel,
    canDeactivate = true,
    title,
    checkerItem,
    modelList,
    defaultShowBrowserRequest,
    disableBrowserRequest,
    className,
    name,
  }) => {
    const { t } = useTranslation('setting');
    const [form] = Form.useForm();
    const { cx, styles } = useStyles();
    const [
      toggleProviderEnabled,
      setSettings,
      enabled,
      isFetchOnClient,
      isProviderEndpointNotEmpty,
      isProviderApiKeyNotEmpty,
    ] = useUserStore((s) => [
      s.toggleProviderEnabled,
      s.setSettings,
      modelConfigSelectors.isProviderEnabled(id)(s),
      modelConfigSelectors.isProviderFetchOnClient(id)(s),
      keyVaultsConfigSelectors.isProviderEndpointNotEmpty(id)(s),
      keyVaultsConfigSelectors.isProviderApiKeyNotEmpty(id)(s),
    ]);

    useSyncSettings(form);

    const apiKeyItem: FormItemProps[] = !showApiKey
      ? []
      : apiKeyItems ?? [
          {
            children: (
              <Input.Password
                autoComplete={'new-password'}
                placeholder={t(`llm.apiKey.placeholder`, { name })}
              />
            ),
            desc: t(`llm.apiKey.desc`, { name }),
            label: t(`llm.apiKey.title`),
            name: [KeyVaultsConfigKey, id, LLMProviderApiTokenKey],
          },
        ];

    const showEndpoint = !!proxyUrl;
    const formItems = [
      ...apiKeyItem,
      showEndpoint && {
        children: <Input allowClear placeholder={proxyUrl?.placeholder} />,
        desc: proxyUrl?.desc || t('llm.proxyUrl.desc'),
        label: proxyUrl?.title || t('llm.proxyUrl.title'),
        name: [KeyVaultsConfigKey, id, LLMProviderBaseUrlKey],
      },
      /*
       * Conditions to show Client Fetch Switch
       * 1. provider is not disabled browser request
       * 2. provider show browser request by default
       * 3. Provider allow to edit endpoint and the value of endpoint is not empty
       * 4. There is an apikey provided by user
       */
      !disableBrowserRequest &&
        (defaultShowBrowserRequest ||
          (showEndpoint && isProviderEndpointNotEmpty) ||
          (showApiKey && isProviderApiKeyNotEmpty)) && {
          children: (
            <Switch
              onChange={(enabled) => {
                setSettings({ [LLMProviderConfigKey]: { [id]: { fetchOnClient: enabled } } });
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
            provider={id}
            showAzureDeployName={modelList?.azureDeployName}
            showModelFetcher={modelList?.showModelFetcher}
          />
        ),
        desc: t('llm.modelList.desc'),
        label: t('llm.modelList.title'),
        name: [LLMProviderConfigKey, id, LLMProviderModelListKey],
      },
      checkerItem ?? {
        children: <Checker model={checkModel!} provider={id} />,
        desc: t('llm.checker.desc'),
        label: t('llm.checker.title'),
        minWidth: undefined,
      },
    ].filter(Boolean) as FormItemProps[];

    /* ↓ cloud slot ↓ */

    /* ↑ cloud slot ↑ */

    const model: ItemGroup = {
      children: formItems,

      defaultActive: canDeactivate ? enabled : undefined,
      extra: canDeactivate ? (
        <Switch
          onChange={(enabled) => {
            toggleProviderEnabled(id, enabled);
          }}
          value={enabled}
        />
      ) : undefined,
      title: (
        <Flexbox
          align={'center'}
          className={styles.safariIconWidthFix}
          horizontal
          style={{
            height: 24,
            maxHeight: 24,
            ...(enabled ? {} : { filter: 'grayscale(100%)', maxHeight: 24, opacity: 0.66 }),
          }}
        >
          {title}
        </Flexbox>
      ),
    };

    return (
      <Form
        className={cx(styles.form, className)}
        form={form}
        items={[model]}
        onValuesChange={debounce(setSettings, 100)}
        {...FORM_STYLE}
      />
    );
  },
);

export default ProviderConfig;
