import { cssVar, cx, Flexbox, Icon, menuSharedStyles, Text } from '@lobehub/ui';
import { LucideGem, type LucideIcon, LucideScale, LucideZap } from 'lucide-react';
import type { AutoRoutingTier } from 'model-bank/autoRouting';
import {
  AUTO_ROUTING_MODEL_IDS,
  AUTO_ROUTING_PROVIDER_ID,
  AUTO_ROUTING_TIER_NAMES,
  AUTO_ROUTING_TIERS,
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
import { styles } from '../styles';

const TIER_ICONS: Record<AutoRoutingTier, LucideIcon> = {
  lite: LucideZap,
  pro: LucideScale,
  ultra: LucideGem,
};

// Plain props and CSS variables only: this panel also mounts in the share app,
// whose bundle carries no StyleX boot CSS.
const SECTION_STYLE = {
  borderBlockEnd: `1px solid ${cssVar.colorBorderSecondary}`,
  flexShrink: 0,
  paddingBlock: 4,
} as const;

interface AutoRoutingBarProps {
  enabledList: EnabledProviderWithModels[];
  model?: string;
  onModelChange?: (params: { model: string; provider: string }) => Promise<void>;
  onOpenChange?: (open: boolean) => void;
  provider?: string;
}

/**
 * Lite / Pro / Ultra as the first rows of the panel, pinned above the scrolling
 * model list and styled like its rows. Rendered only when the server offers the
 * tiers (`ENABLE_AUTO_MODEL_ROUTING`) and a visible model can be routed to.
 */
export const AutoRoutingBar: FC<AutoRoutingBarProps> = memo(
  ({ enabledList, model: modelProp, onModelChange, onOpenChange, provider: providerProp }) => {
    const { t } = useTranslation('components');
    const { onBeforeModelSelect } = useBusinessModelListGuard();
    const { model, provider } = useModelAndProvider(modelProp, providerProp);
    const { handleClose, handleModelChange } = usePanelHandlers({ onModelChange, onOpenChange });

    const enabled = useServerConfigStore(serverConfigSelectors.enableAutoModelRouting);
    // A tier can only land on a model with function calling (the run's default
    // tools); with none visible the tiers are not offered at all.
    const hasRoutableModel = useMemo(
      () =>
        filterRoutableCandidates(
          enabledList.flatMap((item) =>
            item.children.map((child) => ({ ...child, providerId: item.id })),
          ),
        ).length > 0,
      [enabledList],
    );

    if (!enabled || !hasRoutableModel) return null;

    const select = async (tier: AutoRoutingTier) => {
      const modelId = AUTO_ROUTING_MODEL_IDS[tier];
      handleClose();
      if ((await onBeforeModelSelect?.(modelId, AUTO_ROUTING_PROVIDER_ID)) === false) return;
      handleModelChange(modelId, AUTO_ROUTING_PROVIDER_ID);
    };

    return (
      <Flexbox style={SECTION_STYLE}>
        {AUTO_ROUTING_TIERS.map((tier) => {
          const active = isAutoRoutingProvider(provider) && model === AUTO_ROUTING_MODEL_IDS[tier];
          return (
            <Flexbox key={tier} style={{ marginBlock: 1, marginInline: 4 }}>
              <Flexbox
                horizontal
                align={'center'}
                aria-pressed={active}
                className={cx(menuSharedStyles.item, active && styles.menuItemActive)}
                gap={8}
                role={'button'}
                style={{ cursor: 'pointer', paddingBlock: 8, paddingInline: 8 }}
                tabIndex={0}
                onClick={() => void select(tier)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    void select(tier);
                  }
                }}
              >
                <Flexbox align={'center'} flex={'none'} justify={'center'} width={20}>
                  <Icon icon={TIER_ICONS[tier]} size={16} />
                </Flexbox>
                <Text strong={active}>{AUTO_ROUTING_TIER_NAMES[tier]}</Text>
                <Text
                  ellipsis
                  fontSize={12}
                  style={{ marginInlineStart: 'auto' }}
                  type={'secondary'}
                >
                  {t(`ModelSwitchPanel.autoRouting.${tier}.desc`)}
                </Text>
              </Flexbox>
            </Flexbox>
          );
        })}
      </Flexbox>
    );
  },
);

AutoRoutingBar.displayName = 'AutoRoutingBar';
