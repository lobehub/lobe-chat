import { ActionIcon, Icon } from '@lobehub/ui';
import { Dropdown } from 'antd';
import { createStyles } from 'antd-style';
import { LucideArrowRight, LucideBolt } from 'lucide-react';
import { AiModelForSelect } from 'model-bank';
import { type ReactNode, memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';
import { Rnd } from 'react-rnd';
import { useNavigate } from 'react-router-dom';
import urlJoin from 'url-join';
import { VList } from 'virtua';

import { ModelItemRender, ProviderItemRender } from '@/components/ModelSelect';
import { useEnabledChatModels } from '@/hooks/useEnabledChatModels';
import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/selectors';
import { EnabledProviderWithModels } from '@/types/aiProvider';

const STORAGE_KEY = 'MODEL_SWITCH_PANEL_WIDTH';
const DEFAULT_WIDTH = 320;
const MIN_WIDTH = 280;
const MAX_WIDTH = 600;
const MAX_PANEL_HEIGHT = 550;

const INITIAL_BUFFER_SIZE = 10;
const FULL_BUFFER_SIZE = 1000;
const BUFFER_DELAY_MS = 500;

const ITEM_HEIGHT = {
  'empty-model': 38,
  'group-header': 40,
  'model-item': 38,
  'no-provider': 38,
} as const;

const ENABLE_RESIZING = {
  bottom: false,
  bottomLeft: false,
  bottomRight: false,
  left: true,
  right: true,
  top: false,
  topLeft: false,
  topRight: false,
} as const;

const useStyles = createStyles(({ css, token }) => ({
  dropdown: css`
    overflow: hidden;

    width: 100%;
    height: 100%;
    border: 1px solid ${token.colorBorderSecondary};
    border-radius: ${token.borderRadiusLG}px;

    background: ${token.colorBgElevated};
    box-shadow: ${token.boxShadowSecondary};
  `,
  groupHeader: css`
    padding-block: 8px;
    padding-inline: 12px;
    color: ${token.colorTextSecondary};
    background: ${token.colorFillQuaternary};
  `,
  menuItem: css`
    cursor: pointer;

    display: flex;
    gap: 8px;
    align-items: center;

    box-sizing: border-box;
    padding-block: 8px;
    padding-inline: 12px;

    white-space: nowrap;

    &:hover {
      background: ${token.colorFillTertiary};
    }
  `,
  menuItemActive: css`
    background: ${token.colorPrimaryBg};
  `,
  tag: css`
    cursor: pointer;
  `,
}));

const menuKey = (provider: string, model: string) => `${provider}-${model}`;

type VirtualItem =
  | {
      provider: EnabledProviderWithModels;
      type: 'group-header';
    }
  | {
      model: AiModelForSelect;
      provider: EnabledProviderWithModels;
      type: 'model-item';
    }
  | {
      provider: EnabledProviderWithModels;
      type: 'empty-model';
    }
  | {
      type: 'no-provider';
    };

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
}

const ModelSwitchPanel = memo<ModelSwitchPanelProps>(
  ({ children, model: modelProp, provider: providerProp, onModelChange, onOpenChange, open }) => {
    const { t } = useTranslation('components');
    const { t: tCommon } = useTranslation('common');
    const newLabel = tCommon('new');
    const { cx, styles, theme } = useStyles();

    const [panelWidth, setPanelWidth] = useState(() => {
      if (typeof window === 'undefined') return DEFAULT_WIDTH;
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? Number(stored) : DEFAULT_WIDTH;
    });

    const [bufferSize, setBufferSize] = useState(INITIAL_BUFFER_SIZE);
    const bufferTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleOpenChange = useCallback(
      (isOpen: boolean) => {
        if (isOpen) {
          // Start with minimal buffer for fast initial render, then increase after delay
          setBufferSize(INITIAL_BUFFER_SIZE);
          bufferTimerRef.current = setTimeout(() => {
            setBufferSize(FULL_BUFFER_SIZE);
          }, BUFFER_DELAY_MS);
        } else {
          // Reset buffer when closing
          if (bufferTimerRef.current) clearTimeout(bufferTimerRef.current);
          setBufferSize(INITIAL_BUFFER_SIZE);
        }
        onOpenChange?.(isOpen);
      },
      [onOpenChange],
    );

    useEffect(() => {
      return () => {
        if (bufferTimerRef.current) clearTimeout(bufferTimerRef.current);
      };
    }, []);

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

    // Flatten the provider/model tree into a flat list for virtual scrolling
    const { virtualItems, panelHeight } = useMemo(() => {
      if (enabledList.length === 0) {
        return {
          panelHeight: ITEM_HEIGHT['no-provider'],
          virtualItems: [{ type: 'no-provider' }] as VirtualItem[],
        };
      }

      const items: VirtualItem[] = [];
      let totalHeight = 0;

      for (const providerItem of enabledList) {
        // Add provider group header
        items.push({ provider: providerItem, type: 'group-header' });
        totalHeight += ITEM_HEIGHT['group-header'];

        if (providerItem.children.length === 0) {
          // Add empty model placeholder
          items.push({ provider: providerItem, type: 'empty-model' });
          totalHeight += ITEM_HEIGHT['empty-model'];
        } else {
          // Add each model item
          for (const modelItem of providerItem.children) {
            items.push({ model: modelItem, provider: providerItem, type: 'model-item' });
            totalHeight += ITEM_HEIGHT['model-item'];
          }
        }
      }

      return {
        panelHeight: Math.min(totalHeight, MAX_PANEL_HEIGHT),
        virtualItems: items,
      };
    }, [enabledList]);

    const activeKey = menuKey(provider, model);

    const renderVirtualItem = useCallback(
      (item: VirtualItem) => {
        switch (item.type) {
          case 'no-provider': {
            return (
              <div
                className={styles.menuItem}
                key="no-provider"
                onClick={() => navigate('/settings/provider/all')}
              >
                <Flexbox gap={8} horizontal style={{ color: theme.colorTextTertiary }}>
                  {t('ModelSwitchPanel.emptyProvider')}
                  <Icon icon={LucideArrowRight} />
                </Flexbox>
              </div>
            );
          }

          case 'group-header': {
            return (
              <div className={styles.groupHeader} key={`header-${item.provider.id}`}>
                <Flexbox horizontal justify="space-between">
                  <ProviderItemRender
                    logo={item.provider.logo}
                    name={item.provider.name}
                    provider={item.provider.id}
                    source={item.provider.source}
                  />
                  <ActionIcon
                    icon={LucideBolt}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const url = urlJoin('/settings/provider', item.provider.id || 'all');
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
              </div>
            );
          }

          case 'empty-model': {
            return (
              <div
                className={styles.menuItem}
                key={`empty-${item.provider.id}`}
                onClick={() => navigate(`/settings/provider/${item.provider.id}`)}
              >
                <Flexbox gap={8} horizontal style={{ color: theme.colorTextTertiary }}>
                  {t('ModelSwitchPanel.emptyModel')}
                  <Icon icon={LucideArrowRight} />
                </Flexbox>
              </div>
            );
          }

          case 'model-item': {
            const key = menuKey(item.provider.id, item.model.id);
            const isActive = key === activeKey;

            return (
              <div
                className={cx(styles.menuItem, isActive && styles.menuItemActive)}
                key={key}
                onClick={async () => {
                  await handleModelChange(item.model.id, item.provider.id);
                }}
              >
                <ModelItemRender
                  {...item.model}
                  {...item.model.abilities}
                  infoTagTooltipOnHover
                  newBadgeLabel={newLabel}
                  showInfoTag
                />
              </div>
            );
          }

          default: {
            return null;
          }
        }
      },
      [activeKey, cx, handleModelChange, navigate, newLabel, styles, t, theme.colorTextTertiary],
    );

    return (
      <Dropdown
        arrow={false}
        onOpenChange={handleOpenChange}
        open={open}
        placement={'topLeft'}
        popupRender={() => (
          <Rnd
            className={styles.dropdown}
            disableDragging
            enableResizing={ENABLE_RESIZING}
            maxWidth={MAX_WIDTH}
            minWidth={MIN_WIDTH}
            onResizeStop={(_e, _direction, ref) => {
              const newWidth = ref.offsetWidth;
              setPanelWidth(newWidth);
              localStorage.setItem(STORAGE_KEY, String(newWidth));
            }}
            position={{ x: 0, y: 0 }}
            size={{ height: panelHeight, width: panelWidth }}
            style={{ position: 'relative' }}
          >
            <VList bufferSize={bufferSize} style={{ height: panelHeight, width: '100%' }}>
              {virtualItems.map(renderVirtualItem)}
            </VList>
          </Rnd>
        )}
      >
        <div className={styles.tag}>{children}</div>
      </Dropdown>
    );
  },
);

export default ModelSwitchPanel;
export type { ModelSwitchPanelProps };
