'use client';

import { ProviderCombine } from '@lobehub/icons';
import { Form, type FormItemProps, Icon, type ItemGroup, Tooltip } from '@lobehub/ui';
import { Input, Switch } from 'antd';
import { createStyles } from 'antd-style';
import { debounce } from 'lodash-es';
import { LockIcon } from 'lucide-react';
import Link from 'next/link';
import { ReactNode, memo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Center, Flexbox } from 'react-layout-kit';
import urlJoin from 'url-join';

import { useSyncSettings } from '@/app/[variants]/(main)/settings/hooks/useSyncSettings';
import {
  KeyVaultsConfigKey,
  LLMProviderApiTokenKey,
  LLMProviderBaseUrlKey,
  LLMProviderConfigKey,
  LLMProviderModelListKey,
} from '@/app/[variants]/(main)/settings/llm/const';
import { FORM_STYLE } from '@/const/layoutTokens';
import { AES_GCM_URL, BASE_PROVIDER_DOC_URL } from '@/const/url';
import { isServerMode } from '@/const/version';
import { useUserStore } from '@/store/user';
import { keyVaultsConfigSelectors, modelConfigSelectors } from '@/store/user/selectors';
import { ModelProviderCard } from '@/types/llm';
import { GlobalLLMProviderKey } from '@/types/user/settings';

import Checker from '../Checker';
import ProviderModelListSelect from '../ProviderModelList';

const useStyles = createStyles(({ css, prefixCls, responsive, token }) => ({
  aceGcm: css`
    padding-block: 0 !important;
    .${prefixCls}-form-item-label {
      display: none;
    }
    .${prefixCls}-form-item-control {
      width: 100%;

      font-size: 12px;
      color: ${token.colorTextSecondary};
      text-align: center;

      opacity: 0.66;

      transition: opacity 0.2s ${token.motionEaseInOut};

      &:hover {
        opacity: 1;
      }
    }
  `,
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
  help: css`
    border-radius: 50%;

    font-size: 12px;
    font-weight: 500;
    color: ${token.colorTextDescription};

    background: ${token.colorFillTertiary};

    &:hover {
      color: ${token.colorText};
      background: ${token.colorFill};
    }
  `,
}));

export interface ProviderConfigProps extends Omit<ModelProviderCard, 'id' | 'chatModels'> {
  apiKeyItems?: FormItemProps[];
  canDeactivate?: boolean;
  checkerItem?: FormItemProps;
  className?: string;
  extra?: ReactNode;
  hideSwitch?: boolean;
  id: GlobalLLMProviderKey;
  modelList?: {
    azureDeployName?: boolean;
    notFoundContent?: ReactNode;
    placeholder?: string;
    showModelFetcher?: boolean;
  };
  showAceGcm?: boolean;
  title?: ReactNode;
}

const ProviderConfig = memo<ProviderConfigProps>(
  ({
    apiKeyItems,
    id,
    proxyUrl,
    showApiKey = true,
    checkModel,
    canDeactivate = true,
    checkerItem,
    modelList,
    title,
    defaultShowBrowserRequest,
    disableBrowserRequest,
    className,
    name,
    showAceGcm = true,
    showChecker = true,
    extra,
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
      : (apiKeyItems ?? [
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
        ]);

    const aceGcmItem: FormItemProps = {
      children: (
        <>
          <Icon icon={LockIcon} style={{ marginRight: 4 }} />
          <Trans i18nKey="llm.aesGcm" ns={'setting'}>
            您的秘钥与代理地址等将使用
            <Link href={AES_GCM_URL} style={{ marginInline: 4 }} target={'_blank'}>
              AES-GCM
            </Link>
            加密算法进行加密
          </Trans>
        </>
      ),
      className: styles.aceGcm,
      minWidth: undefined,
    };

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
      showChecker
        ? (checkerItem ?? {
            children: <Checker model={checkModel!} provider={id} />,
            desc: t('llm.checker.desc'),
            label: t('llm.checker.title'),
            minWidth: undefined,
          })
        : undefined,
      showAceGcm && isServerMode && aceGcmItem,
    ].filter(Boolean) as FormItemProps[];

    /* ↓ cloud slot ↓ */

    /* ↑ cloud slot ↑ */

    const model: ItemGroup = {
      children: formItems,

      defaultActive: canDeactivate ? enabled : undefined,

      extra: (
        <Flexbox align={'center'} gap={8} horizontal>
          {extra}
          <Tooltip title={t('llm.helpDoc')}>
            <Link
              href={urlJoin(BASE_PROVIDER_DOC_URL, id)}
              onClick={(e) => e.stopPropagation()}
              target={'_blank'}
            >
              <Center className={styles.help} height={20} width={20}>
                ?
              </Center>
            </Link>
          </Tooltip>
          {canDeactivate ? (
            <Switch
              onChange={(enabled) => {
                toggleProviderEnabled(id, enabled);
              }}
              value={enabled}
            />
          ) : undefined}
        </Flexbox>
      ),
      title: (
        <Flexbox
          align={'center'}
          horizontal
          style={{
            height: 24,
            maxHeight: 24,
            ...(enabled ? {} : { filter: 'grayscale(100%)', maxHeight: 24, opacity: 0.66 }),
          }}
        >
          {title ?? <ProviderCombine provider={id} size={24} />}
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
