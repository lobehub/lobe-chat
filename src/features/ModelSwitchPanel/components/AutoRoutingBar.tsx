import { Block, cssVar, Flexbox, Text, Tooltip } from '@lobehub/ui';
import type { AutoRoutingTier } from 'model-bank/autoRouting';
import {
  AUTO_ROUTING_MODEL_IDS,
  AUTO_ROUTING_PROVIDER_ID,
  AUTO_ROUTING_TIER_NAMES,
  AUTO_ROUTING_TIERS,
  buildAutoRoutingTable,
  filterRoutableCandidates,
  isAutoRoutingProvider,
} from 'model-bank/autoRouting';
import { type FC, memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useBusinessModelListGuard } from '@/business/client/hooks/useBusinessModelListGuard';
import { serverConfigSelectors, useServerConfigStore } from '@/store/serverConfig';
import type { EnabledProviderWithModels } from '@/types/aiProvider';

import { useModelAndProvider } from '../hooks/useModelAndProvider';
import { usePanelHandlers } from '../hooks/usePanelHandlers';

// Plain props and CSS variables only: this panel also mounts in the share app,
// whose bundle carries no StyleX boot CSS.
const BAR_STYLE = {
  borderBlockEnd: `1px solid ${cssVar.colorBorderSecondary}`,
  flexShrink: 0,
} as const;

/** Fewer visible models than this and the tiers cannot differ much. */
const FEW_MODELS = 3;

interface AutoRoutingBarProps {
  enabledList: EnabledProviderWithModels[];
  model?: string;
  onModelChange?: (params: { model: string; provider: string }) => Promise<void>;
  onOpenChange?: (open: boolean) => void;
  provider?: string;
}

/**
 * Lite / Pro / Ultra, pinned above the scrolling model list. Rendered only when
 * the server offers the tiers (`ENABLE_AUTO_MODEL_ROUTING`) and a chat model is
 * visible to route to.
 */
export const AutoRoutingBar: FC<AutoRoutingBarProps> = memo(
  ({ enabledList, model: modelProp, onModelChange, onOpenChange, provider: providerProp }) => {
    const { t } = useTranslation('components');
    const { onBeforeModelSelect } = useBusinessModelListGuard();
    const { model, provider } = useModelAndProvider(modelProp, providerProp);
    const { handleClose, handleModelChange } = usePanelHandlers({ onModelChange, onOpenChange });

    const enabled = useServerConfigStore(serverConfigSelectors.enableAutoModelRouting);
    const candidates = useMemo(
      () =>
        enabledList.flatMap((item) =>
          item.children.map((child) => ({ ...child, providerId: item.id })),
        ),
      [enabledList],
    );
    // The server only routes to models with function calling; preview the same set.
    const routable = useMemo(() => filterRoutableCandidates(candidates), [candidates]);
    const table = useMemo(() => buildAutoRoutingTable(routable), [routable]);

    // Without a function-calling model a tier could only land on a model that
    // drops the run's default tools, so the tiers are not offered at all.
    if (!enabled || routable.length === 0) return null;

    const select = async (tier: AutoRoutingTier) => {
      const modelId = AUTO_ROUTING_MODEL_IDS[tier];
      handleClose();
      if ((await onBeforeModelSelect?.(modelId, AUTO_ROUTING_PROVIDER_ID)) === false) return;
      handleModelChange(modelId, AUTO_ROUTING_PROVIDER_ID);
    };

    const routesTo = (tier: AutoRoutingTier) => (
      <Flexbox gap={2}>
        <Text strong>{t('ModelSwitchPanel.autoRouting.routesTo')}</Text>
        {table[tier].map((cell, difficulty) => (
          <Text key={difficulty}>
            {t(`ModelSwitchPanel.autoRouting.difficulty.${difficulty as 0 | 1 | 2}`)}:{' '}
            {cell[0]?.candidate.displayName || cell[0]?.candidate.id}
          </Text>
        ))}
        {routable.length < FEW_MODELS && (
          <Text type={'secondary'}>{t('ModelSwitchPanel.autoRouting.fewModels')}</Text>
        )}
      </Flexbox>
    );

    return (
      <Flexbox gap={6} padding={8} style={BAR_STYLE}>
        <Text fontSize={12} type={'secondary'}>
          {t('ModelSwitchPanel.autoRouting.title')}
        </Text>
        <Flexbox horizontal gap={6}>
          {AUTO_ROUTING_TIERS.map((tier) => {
            const active =
              isAutoRoutingProvider(provider) && model === AUTO_ROUTING_MODEL_IDS[tier];
            return (
              <Tooltip key={tier} placement={'right'} title={routesTo(tier)}>
                <Block
                  clickable
                  aria-pressed={active}
                  flex={1}
                  gap={2}
                  paddingBlock={6}
                  paddingInline={8}
                  role={'button'}
                  style={{ minWidth: 0 }}
                  tabIndex={0}
                  variant={active ? 'filled' : 'outlined'}
                  onClick={() => void select(tier)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      void select(tier);
                    }
                  }}
                >
                  <Text strong>{AUTO_ROUTING_TIER_NAMES[tier]}</Text>
                  <Text fontSize={12} type={'secondary'}>
                    {t(`ModelSwitchPanel.autoRouting.${tier}.desc`)}
                  </Text>
                </Block>
              </Tooltip>
            );
          })}
        </Flexbox>
      </Flexbox>
    );
  },
);

AutoRoutingBar.displayName = 'AutoRoutingBar';
