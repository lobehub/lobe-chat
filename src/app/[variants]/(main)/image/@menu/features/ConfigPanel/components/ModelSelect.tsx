import { ActionIcon, Icon, Select, type SelectProps } from '@lobehub/ui';
import { createStyles, useTheme } from 'antd-style';
import { LucideArrowRight, LucideBolt } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { ModelItemRender, ProviderItemRender } from '@/components/ModelSelect';
import { isDeprecatedEdition } from '@/const/version';
import { useAiInfraStore } from '@/store/aiInfra';
import { aiProviderSelectors } from '@/store/aiInfra/slices/aiProvider/selectors';
import { useImageStore } from '@/store/image';
import { imageGenerationConfigSelectors } from '@/store/image/slices/generationConfig/selectors';
import { featureFlagsSelectors, useServerConfigStore } from '@/store/serverConfig';
import { EnabledProviderWithModels } from '@/types/aiProvider';

const useStyles = createStyles(({ css, prefixCls }) => ({
  popup: css`
    &.${prefixCls}-select-dropdown .${prefixCls}-select-item-option-grouped {
      padding-inline-start: 12px;
    }
  `,
}));

interface ModelOption {
  label: any;
  provider: string;
  value: string;
}

const ModelSelect = memo(() => {
  const { styles } = useStyles();
  const { t } = useTranslation('components');
  const theme = useTheme();
  const { showLLM } = useServerConfigStore(featureFlagsSelectors);
  const router = useRouter();

  const [currentModel, currentProvider] = useImageStore((s) => [
    imageGenerationConfigSelectors.model(s),
    imageGenerationConfigSelectors.provider(s),
  ]);
  const setModelAndProviderOnSelect = useImageStore((s) => s.setModelAndProviderOnSelect);

  const enabledImageModelList = useAiInfraStore(aiProviderSelectors.enabledImageModelList);

  const options = useMemo<SelectProps['options']>(() => {
    const getImageModels = (provider: EnabledProviderWithModels) => {
      const modelOptions = provider.children.map((model) => ({
        label: <ModelItemRender {...model} {...model.abilities} showInfoTag={false} />,
        provider: provider.id,
        value: `${provider.id}/${model.id}`,
      }));

      // if there are no models, add a placeholder guide
      if (modelOptions.length === 0) {
        return [
          {
            disabled: true,
            label: (
              <Flexbox gap={8} horizontal style={{ color: theme.colorTextTertiary }}>
                {t('ModelSwitchPanel.emptyModel')}
                <Icon icon={LucideArrowRight} />
              </Flexbox>
            ),
            onClick: () => {
              router.push(
                isDeprecatedEdition
                  ? '/settings?active=llm'
                  : `/settings?active=provider&provider=${provider.id}`,
              );
            },
            value: `${provider.id}/empty`,
          },
        ];
      }

      return modelOptions;
    };

    // if there are no providers at all
    if (enabledImageModelList.length === 0) {
      return [
        {
          disabled: true,
          label: (
            <Flexbox gap={8} horizontal style={{ color: theme.colorTextTertiary }}>
              {t('ModelSwitchPanel.emptyProvider')}
              <Icon icon={LucideArrowRight} />
            </Flexbox>
          ),
          onClick: () => {
            router.push(isDeprecatedEdition ? '/settings?active=llm' : '/settings?active=provider');
          },
          value: 'no-provider',
        },
      ];
    }

    if (enabledImageModelList.length === 1) {
      const provider = enabledImageModelList[0];
      return getImageModels(provider);
    }

    return enabledImageModelList.map((provider) => ({
      label: (
        <Flexbox horizontal justify="space-between">
          <ProviderItemRender
            logo={provider.logo}
            name={provider.name}
            provider={provider.id}
            source={provider.source}
          />
          {showLLM && (
            <Link
              href={
                isDeprecatedEdition
                  ? '/settings?active=llm'
                  : `/settings?active=provider&provider=${provider.id}`
              }
            >
              <ActionIcon
                icon={LucideBolt}
                size={'small'}
                title={t('ModelSwitchPanel.goToSettings')}
              />
            </Link>
          )}
        </Flexbox>
      ),
      options: getImageModels(provider),
    }));
  }, [enabledImageModelList, showLLM, t, theme.colorTextTertiary, router]);

  return (
    <Select
      classNames={{
        root: styles.popup,
      }}
      onChange={(value, option) => {
        // Skip onChange for disabled options (empty states)
        if (value === 'no-provider' || value.includes('/empty')) return;
        const model = value.split('/').slice(1).join('/');
        const provider = (option as unknown as ModelOption).provider;
        if (model !== currentModel || provider !== currentProvider) {
          setModelAndProviderOnSelect(model, provider);
        }
      }}
      options={options}
      shadow
      size={'large'}
      style={{
        width: '100%',
      }}
      value={currentProvider && currentModel ? `${currentProvider}/${currentModel}` : undefined}
    />
  );
});

export default ModelSelect;
