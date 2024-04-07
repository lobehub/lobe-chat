import { Form, type FormItemProps, type ItemGroup } from '@lobehub/ui';
import { Form as AntForm, Input, Switch } from 'antd';
import { debounce } from 'lodash-es';
import { ReactNode, memo } from 'react';
import { useTranslation } from 'react-i18next';

import { useSyncSettings } from '@/app/settings/hooks/useSyncSettings';
import {
  LLMProviderApiTokenKey,
  LLMProviderBaseUrlKey,
  LLMProviderConfigKey,
  LLMProviderCustomModelKey,
} from '@/app/settings/llm/const';
import { FORM_STYLE } from '@/const/layoutTokens';
import { useGlobalStore } from '@/store/global';
import { modelProviderSelectors } from '@/store/global/selectors';
import { GlobalLLMProviderKey } from '@/types/settings';

import Checker from '../Checker';

interface ProviderConfigProps {
  canDeactivate?: boolean;
  checkModel?: string;
  checkerItem?: FormItemProps;
  configItems?: FormItemProps[];
  provider: GlobalLLMProviderKey;
  showApiKey?: boolean;
  showCustomModelName?: boolean;
  showEndpoint?: boolean;
  title: ReactNode;
}

const ProviderConfig = memo<ProviderConfigProps>(
  ({
    provider,
    showCustomModelName,
    showEndpoint,
    showApiKey = true,
    checkModel,
    canDeactivate = true,
    title,
    configItems,
    checkerItem,
  }) => {
    const { t } = useTranslation('setting');
    const [form] = AntForm.useForm();
    const [toggleProviderEnabled, setSettings, enabled] = useGlobalStore((s) => [
      s.toggleProviderEnabled,
      s.setSettings,
      modelProviderSelectors.providerEnabled(provider)(s),
    ]);

    useSyncSettings(form);

    const defaultFormItems = [
      showApiKey && {
        children: (
          <Input.Password
            autoComplete={'new-password'}
            placeholder={t(`llm.${provider}.token.placeholder` as any)}
          />
        ),
        desc: t(`llm.${provider}.token.desc` as any),
        label: t(`llm.${provider}.token.title` as any),
        name: [LLMProviderConfigKey, provider, LLMProviderApiTokenKey],
      },
      showEndpoint && {
        children: (
          <Input allowClear placeholder={t(`llm.${provider}.endpoint.placeholder` as any)} />
        ),
        desc: t(`llm.${provider}.endpoint.desc` as any),
        label: t(`llm.${provider}.endpoint.title` as any),
        name: [LLMProviderConfigKey, provider, LLMProviderBaseUrlKey],
      },
      showCustomModelName && {
        children: (
          <Input.TextArea
            allowClear
            placeholder={t(`llm.${provider}.customModelName.placeholder` as any)}
            style={{ height: 100 }}
          />
        ),
        desc: t(`llm.${provider}.customModelName.desc` as any),
        label: t(`llm.${provider}.customModelName.title` as any),
        name: [LLMProviderConfigKey, provider, LLMProviderCustomModelKey],
      },
      checkerItem ?? {
        children: <Checker model={checkModel!} provider={provider} />,
        desc: t('llm.checker.desc'),
        label: t('llm.checker.title'),
        minWidth: '100%',
      },
    ].filter(Boolean) as FormItemProps[];

    const model: ItemGroup = {
      children: configItems ?? defaultFormItems,

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
      />
    );
  },
);

export default ProviderConfig;
