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

interface ProviderConfigProps {
  apiKeyItems?: FormItemProps[];
  canDeactivate?: boolean;
  checkModel?: string;
  checkerItem?: FormItemProps;
  className?: string;
  hideSwitch?: boolean;
  modelList?: {
    azureDeployName?: boolean;
    notFoundContent?: ReactNode;
    placeholder?: string;
    showModelFetcher?: boolean;
  };
  provider: GlobalLLMProviderKey;
  proxyUrl?:
    | {
        desc?: string;
        placeholder: string;
        title?: string;
      }
    | false;
  showApiKey?: boolean;
  showBrowserRequest?: boolean;
  title: ReactNode;
}

const ProviderConfig = memo<ProviderConfigProps>(
  ({
    apiKeyItems,
    provider,
    proxyUrl,
    showApiKey = true,
    checkModel,
    canDeactivate = true,
    title,
    checkerItem,
    modelList,
    showBrowserRequest,
    className,
  }) => {
    const { t } = useTranslation('setting');
    const { t: modelT } = useTranslation('modelProvider');
    const [form] = Form.useForm();
    const { cx, styles } = useStyles();
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

    const showEndpoint = !!proxyUrl;
    const formItems = [
      ...apiKeyItem,
      showEndpoint && {
        children: <Input allowClear placeholder={proxyUrl?.placeholder} />,
        desc: proxyUrl?.desc || t('llm.proxyUrl.desc'),
        label: proxyUrl?.title || t('llm.proxyUrl.title'),
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
