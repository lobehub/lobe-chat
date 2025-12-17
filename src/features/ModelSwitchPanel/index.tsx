import { ActionIcon, Icon } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import type { ItemType } from 'antd/es/menu/interface';
import { LucideArrowRight, LucideBolt } from 'lucide-react';
import { type ReactNode, memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';
import { useNavigate } from 'react-router-dom';
import urlJoin from 'url-join';

import { ModelItemRender, ProviderItemRender } from '@/components/ModelSelect';
import ActionDropdown from '@/features/ChatInput/ActionBar/components/ActionDropdown';
import { useEnabledChatModels } from '@/hooks/useEnabledChatModels';
import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/selectors';
import { EnabledProviderWithModels } from '@/types/aiProvider';

const useStyles = createStyles(({ css, prefixCls }) => ({
  menu: css`
    .${prefixCls}-dropdown-menu-item {
      display: flex;
      gap: 8px;
    }
    .${prefixCls}-dropdown-menu {
      &-item-group-title {
        padding-inline: 8px;
      }

      &-item-group-list {
        margin: 0 !important;
      }
    }
  `,
  tag: css`
    cursor: pointer;
  `,
}));

const menuKey = (provider: string, model: string) => `${provider}-${model}`;

interface ModelSwitchPanelProps {
  children?: ReactNode;
  /**
   * Current model ID. If not provided, uses currentAgentModel from store.
   */
  model?: string;
  /**
   * Callback when model changes. If not provided, uses updateAgentConfig from store.
   */
  onModelChange?: (params: { model: string; provider: string }) => Promise<void>;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
  /**
   * Current provider ID. If not provided, uses currentAgentModelProvider from store.
   */
  provider?: string;
  updating?: boolean;
}

const ModelSwitchPanel = memo<ModelSwitchPanelProps>(
  ({ children, model: modelProp, provider: providerProp, onModelChange, onOpenChange, open }) => {
    const { t } = useTranslation('components');
    const { styles, theme } = useStyles();

    // Get values from store for fallback when props are not provided
    const [storeModel, storeProvider, updateAgentConfig] = useAgentStore((s) => [
      agentSelectors.currentAgentModel(s),
      agentSelectors.currentAgentModelProvider(s),
      s.updateAgentConfig,
    ]);

    // Use props if provided, otherwise fallback to store values
    const model = modelProp ?? storeModel;
    const provider = providerProp ?? storeProvider;

    const navigate = useNavigate();
    const enabledList = useEnabledChatModels();

    const handleModelChange = useCallback(
      async (modelId: string, providerId: string) => {
        const params = { model: modelId, provider: providerId };
        if (onModelChange) {
          await onModelChange(params);
        } else {
          await updateAgentConfig(params);
        }
      },
      [onModelChange, updateAgentConfig],
    );

    const items = useMemo<ItemType[]>(() => {
      const getModelItems = (providerItem: EnabledProviderWithModels) => {
        const modelItems = providerItem.children.map((modelItem) => ({
          key: menuKey(providerItem.id, modelItem.id),
          label: <ModelItemRender {...modelItem} {...modelItem.abilities} />,
          onClick: async () => {
            await handleModelChange(modelItem.id, providerItem.id);
          },
        }));

        // if there is empty items, add a placeholder guide
        if (modelItems.length === 0)
          return [
            {
              key: `${providerItem.id}-empty`,
              label: (
                <Flexbox gap={8} horizontal style={{ color: theme.colorTextTertiary }}>
                  {t('ModelSwitchPanel.emptyModel')}
                  <Icon icon={LucideArrowRight} />
                </Flexbox>
              ),
              onClick: () => {
                navigate(`/settings?active=provider&provider=${providerItem.id}`);
              },
            },
          ];

        return modelItems;
      };

      if (enabledList.length === 0)
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
              navigate('/settings?active=provider');
            },
          },
        ];

      // otherwise show with provider group
      return enabledList.map((providerItem) => ({
        children: getModelItems(providerItem),
        key: providerItem.id,
        label: (
          <Flexbox horizontal justify="space-between">
            <ProviderItemRender
              logo={providerItem.logo}
              name={providerItem.name}
              provider={providerItem.id}
              source={providerItem.source}
            />
            <ActionIcon
              icon={LucideBolt}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const url = urlJoin('/settings/provider', providerItem.id || 'all');
                if (e.ctrlKey || e.metaKey) {
                  window.open(url, '_blank');
                } else {
                  navigate(url);
                }
              }}
              size={'small'}
              title={t('ModelSwitchPanel.goToSettings')}
            />
          </Flexbox>
        ),
        type: 'group',
      }));
    }, [enabledList, handleModelChange, navigate, t, theme.colorTextTertiary]);

    const icon = <div className={styles.tag}>{children}</div>;

    return (
      <ActionDropdown
        menu={{
          // @ts-expect-error 等待 antd 修复
          activeKey: menuKey(provider, model),
          className: styles.menu,
          items,
          // 不加限高就会导致面板超长，顶部的内容会被隐藏
          // https://github.com/user-attachments/assets/9c043c47-42c5-46ef-b5c1-bee89376f042
          style: {
            maxHeight: 550,
            overflowY: 'scroll',
          },
        }}
        onOpenChange={onOpenChange}
        open={open}
        placement={'topLeft'}
      >
        {icon}
      </ActionDropdown>
    );
  },
);

export default ModelSwitchPanel;
export type { ModelSwitchPanelProps };
