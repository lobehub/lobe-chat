import { ActionIcon, Icon } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { ItemType } from 'antd/es/menu/interface';
import { LucideArrowRight, LucideBolt } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { ModelItemRender, ProviderItemRender } from '@/components/ModelSelect';
import { isDeprecatedEdition } from '@/const/version';
import ActionDropdown from '@/features/ChatInput/ActionBar/components/ActionDropdown';
import { useAiInfraStore } from '@/store/aiInfra';
import { aiProviderSelectors } from '@/store/aiInfra/slices/aiProvider/selectors';
import { useImageStore } from '@/store/image';
import { imageGenerationConfigSelectors } from '@/store/image/slices/generationConfig/selectors';
import { featureFlagsSelectors, useServerConfigStore } from '@/store/serverConfig';
import { EnabledProviderWithModels } from '@/types/aiProvider';

const useStyles = createStyles(({ css, token }) => ({
  menu: css`
    overflow-y: scroll;
    max-height: 500px;
  `,
  modelSelect: css`
    cursor: pointer;
    padding: ${token.paddingSM}px;
    border: 1px solid ${token.colorBorder};
    border-radius: ${token.borderRadius}px;

    &:hover {
      background-color: ${token.colorFillTertiary};
    }
  `,
}));

const menuKey = (provider: string, model: string) => `${provider}-${model}`;

const ModelSelect = memo(() => {
  const { t } = useTranslation('components');
  const { styles, theme } = useStyles();
  const { showLLM } = useServerConfigStore(featureFlagsSelectors);
  const router = useRouter();

  const [currentModel, currentProvider] = useImageStore((s) => [
    imageGenerationConfigSelectors.model(s),
    imageGenerationConfigSelectors.provider(s),
  ]);
  const setModelAndProviderOnSelect = useImageStore((s) => s.setModelAndProviderOnSelect);

  const enabledImageModelList = useAiInfraStore(aiProviderSelectors.enabledImageModelList);

  const items = useMemo<ItemType[]>(() => {
    const getModelItems = (provider: EnabledProviderWithModels) => {
      const items = provider.children.map((model) => ({
        key: menuKey(provider.id, model.id),
        label: <ModelItemRender {...model} {...model.abilities} />,
        onClick: async () => {
          if (model.id !== currentModel || provider.id !== currentProvider) {
            setModelAndProviderOnSelect(model.id, provider.id);
          }
        },
      }));

      // if there is empty items, add a placeholder guide
      if (items.length === 0)
        return [
          {
            key: `${provider.id}-empty`,
            label: (
              <Flexbox gap={8} horizontal style={{ color: theme.colorTextTertiary }}>
                {t('ModelSwitchPanel.emptyModel')}
                <Icon icon={LucideArrowRight} />
              </Flexbox>
            ),
            onClick: () => {
              router.push(
                isDeprecatedEdition ? '/settings/llm' : `/settings/provider/${provider.id}`,
              );
            },
          },
        ];

      return items;
    };

    if (enabledImageModelList.length === 0)
      return [
        {
          key: `no-provider`,
          label: (
            <Flexbox gap={8} horizontal style={{ color: theme.colorTextTertiary }}>
              {t('ModelSwitchPanel.emptyProvider')}
              <Icon icon={LucideArrowRight} />
            </Flexbox>
          ),
          onClick: () => {
            router.push(isDeprecatedEdition ? '/settings/llm' : `/settings/provider`);
          },
        },
      ];

    // otherwise show with provider group
    return enabledImageModelList.map((provider) => ({
      children: getModelItems(provider),
      key: provider.id,
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
              href={isDeprecatedEdition ? '/settings/llm' : `/settings/provider/${provider.id}`}
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
      type: 'group',
    }));
  }, [enabledImageModelList, router, t, theme.colorTextTertiary, currentModel, currentProvider]);

  return (
    <ActionDropdown
      menu={{
        className: styles.menu,
        items,
      }}
      placement={'bottom'}
      trigger={['click']}
    >
      {/* FIXME: 不包一层没法触发 dropdown展开 */}
      <Flexbox align="center" className={styles.modelSelect} horizontal justify="space-between">
        <ModelItemRender displayName={currentModel} id={currentModel} showInfoTag={false} />
      </Flexbox>
    </ActionDropdown>
  );
});

export default ModelSelect;
