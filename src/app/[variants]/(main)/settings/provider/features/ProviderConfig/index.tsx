'use client';

import { ProviderCombine } from '@lobehub/icons';
import { Avatar, Form, type FormItemProps, Icon, type ItemGroup, Tooltip } from '@lobehub/ui';
import { useDebounceFn } from 'ahooks';
import { Skeleton, Switch } from 'antd';
import { createStyles } from 'antd-style';
import { Loader2Icon, LockIcon } from 'lucide-react';
import Link from 'next/link';
import { ReactNode, memo, useLayoutEffect } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Center, Flexbox } from 'react-layout-kit';
import urlJoin from 'url-join';
import { z } from 'zod';

import { FormInput, FormPassword } from '@/components/FormInput';
import { FORM_STYLE } from '@/const/layoutTokens';
import { AES_GCM_URL, BASE_PROVIDER_DOC_URL } from '@/const/url';
import { isServerMode } from '@/const/version';
import { aiProviderSelectors, useAiInfraStore } from '@/store/aiInfra';
import {
  AiProviderDetailItem,
  AiProviderSourceEnum,
  AiProviderSourceType,
} from '@/types/aiProvider';

import { KeyVaultsConfigKey, LLMProviderApiTokenKey, LLMProviderBaseUrlKey } from '../../const';
import Checker, { CheckErrorRender } from './Checker';
import EnableSwitch from './EnableSwitch';
import { SkeletonInput } from './SkeletonInput';
import UpdateProviderInfo from './UpdateProviderInfo';

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
  switchLoading: css`
    width: 44px !important;
    min-width: 44px !important;
    height: 22px !important;
    border-radius: 12px !important;
  `,
}));

export interface ProviderConfigProps extends Omit<AiProviderDetailItem, 'enabled' | 'source'> {
  apiKeyItems?: FormItemProps[];
  canDeactivate?: boolean;
  checkErrorRender?: CheckErrorRender;
  className?: string;
  enabled?: boolean;
  extra?: ReactNode;
  hideSwitch?: boolean;
  modelList?: {
    azureDeployName?: boolean;
    notFoundContent?: ReactNode;
    placeholder?: string;
    showModelFetcher?: boolean;
  };
  showAceGcm?: boolean;
  source?: AiProviderSourceType;
  title?: ReactNode;
}

const ProviderConfig = memo<ProviderConfigProps>(
  ({
    apiKeyItems,
    id,
    settings,
    checkModel,
    logo,
    className,
    checkErrorRender,
    name,
    showAceGcm = true,
    extra,
    source = AiProviderSourceEnum.Builtin,
  }) => {
    const {
      proxyUrl,
      showApiKey = true,
      defaultShowBrowserRequest,
      disableBrowserRequest,
      showChecker = true,
    } = settings || {};
    const { t } = useTranslation('modelProvider');
    const [form] = Form.useForm();
    const { cx, styles, theme } = useStyles();

    const [
      useFetchAiProviderItem,
      updateAiProviderConfig,
      enabled,
      isLoading,
      configUpdating,
      isFetchOnClient,
      isProviderEndpointNotEmpty,
      isProviderApiKeyNotEmpty,
    ] = useAiInfraStore((s) => [
      s.useFetchAiProviderItem,
      s.updateAiProviderConfig,
      aiProviderSelectors.isProviderEnabled(id)(s),
      aiProviderSelectors.isAiProviderConfigLoading(id)(s),
      aiProviderSelectors.isProviderConfigUpdating(id)(s),
      aiProviderSelectors.isProviderFetchOnClient(id)(s),
      aiProviderSelectors.isActiveProviderEndpointNotEmpty(s),
      aiProviderSelectors.isActiveProviderApiKeyNotEmpty(s),
    ]);

    const { data } = useFetchAiProviderItem(id);

    useLayoutEffect(() => {
      if (isLoading) return;

      // set the first time
      form.setFieldsValue(data);
    }, [isLoading, id, data]);

    const { run: debouncedUpdate } = useDebounceFn(updateAiProviderConfig, { wait: 500 });

    const isCustom = source === AiProviderSourceEnum.Custom;

    const apiKeyItem: FormItemProps[] = !showApiKey
      ? []
      : (apiKeyItems ?? [
          {
            children: isLoading ? (
              <SkeletonInput />
            ) : (
              <FormPassword
                autoComplete={'new-password'}
                placeholder={t(`providerModels.config.apiKey.placeholder`, { name })}
                suffix={
                  configUpdating && (
                    <Icon icon={Loader2Icon} spin style={{ color: theme.colorTextTertiary }} />
                  )
                }
              />
            ),
            desc: t(`providerModels.config.apiKey.desc`, { name }),
            label: t(`providerModels.config.apiKey.title`),
            name: [KeyVaultsConfigKey, LLMProviderApiTokenKey],
          },
        ]);

    const aceGcmItem: FormItemProps = {
      children: (
        <>
          <Icon icon={LockIcon} style={{ marginRight: 4 }} />
          <Trans i18nKey="providerModels.config.aesGcm" ns={'modelProvider'}>
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

    const showEndpoint = !!proxyUrl || isCustom;

    const endpointItem = showEndpoint
      ? {
          children: isLoading ? (
            <SkeletonInput />
          ) : (
            <FormInput
              allowClear
              placeholder={
                (!!proxyUrl && proxyUrl?.placeholder) ||
                t('providerModels.config.baseURL.placeholder')
              }
              suffix={
                configUpdating && (
                  <Icon icon={Loader2Icon} spin style={{ color: theme.colorTextTertiary }} />
                )
              }
            />
          ),
          desc: (!!proxyUrl && proxyUrl?.desc) || t('providerModels.config.baseURL.desc'),
          label: (!!proxyUrl && proxyUrl?.title) || t('providerModels.config.baseURL.title'),
          name: [KeyVaultsConfigKey, LLMProviderBaseUrlKey],
          rules: [
            {
              validator: (_: any, value: string) => {
                if (!value) return;

                return z.string().url().safeParse(value).error
                  ? Promise.reject(t('providerModels.config.baseURL.invalid'))
                  : Promise.resolve();
              },
            },
          ],
        }
      : undefined;

    /*
     * Conditions to show Client Fetch Switch
     * 1. provider is not disabled browser request
     * 2. provider show browser request by default
     * 3. Provider allow to edit endpoint and the value of endpoint is not empty
     * 4. There is an apikey provided by user
     */
    const showClientFetch =
      !disableBrowserRequest &&
      (defaultShowBrowserRequest ||
        (showEndpoint && isProviderEndpointNotEmpty) ||
        (showApiKey && isProviderApiKeyNotEmpty));
    const clientFetchItem = showClientFetch && {
      children: isLoading ? (
        <Skeleton.Button active className={styles.switchLoading} />
      ) : (
        <Switch checked={isFetchOnClient} disabled={configUpdating} />
      ),
      desc: t('providerModels.config.fetchOnClient.desc'),
      label: t('providerModels.config.fetchOnClient.title'),
      minWidth: undefined,
      name: 'fetchOnClient',
    };

    const configItems = [
      ...apiKeyItem,
      endpointItem,
      clientFetchItem,
      showChecker
        ? {
            children: isLoading ? (
              <Skeleton.Button active />
            ) : (
              <Checker
                checkErrorRender={checkErrorRender}
                model={data?.checkModel || checkModel!}
                provider={id}
              />
            ),
            desc: t('providerModels.config.checker.desc'),
            label: t('providerModels.config.checker.title'),
            minWidth: undefined,
          }
        : undefined,
      showAceGcm && isServerMode && aceGcmItem,
    ].filter(Boolean) as FormItemProps[];

    const logoUrl = data?.logo ?? logo;
    const model: ItemGroup = {
      children: configItems,

      defaultActive: true,

      extra: (
        <Flexbox align={'center'} gap={8} horizontal>
          {extra}

          {isCustom && <UpdateProviderInfo />}
          <EnableSwitch id={id} />
        </Flexbox>
      ),
      title: (
        <Flexbox
          align={'center'}
          gap={4}
          horizontal
          style={{
            height: 24,
            maxHeight: 24,
            ...(enabled ? {} : { filter: 'grayscale(100%)', maxHeight: 24, opacity: 0.66 }),
          }}
        >
          {isCustom ? (
            <Flexbox align={'center'} gap={8} horizontal>
              {logoUrl ? (
                <Avatar avatar={logoUrl} shape={'circle'} size={32} title={name || id} />
              ) : (
                <ProviderCombine provider={'not-exist-provider'} size={24} />
              )}
              {name}
            </Flexbox>
          ) : (
            <>
              <ProviderCombine provider={id} size={24} />
              <Tooltip title={t('providerModels.config.helpDoc')}>
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
            </>
          )}
        </Flexbox>
      ),
    };

    return (
      <Form
        className={cx(styles.form, className)}
        form={form}
        items={[model]}
        onValuesChange={(_, values) => {
          debouncedUpdate(id, values);
        }}
        variant={'pure'}
        {...FORM_STYLE}
      />
    );
  },
);

export default ProviderConfig;

export { SkeletonInput } from './SkeletonInput';
