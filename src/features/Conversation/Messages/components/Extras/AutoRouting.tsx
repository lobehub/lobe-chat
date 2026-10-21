import { Flexbox, Text, Tooltip } from '@lobehub/ui';
import type { AutoRoutingMessageMetadata } from 'model-bank/autoRouting';
import { AUTO_ROUTING_TIER_NAMES } from 'model-bank/autoRouting';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { ModelIcon } from '@/components/LobeIcons';
import { aiModelSelectors, useAiInfraStore } from '@/store/aiInfra';

/** "Pro · <real model>" under an auto-routed reply; the tooltip says why. */
const AutoRouting = memo<{ routing: AutoRoutingMessageMetadata }>(({ routing }) => {
  const { t } = useTranslation('components');
  const card = useAiInfraStore(
    aiModelSelectors.getEnabledModelById(routing.model, routing.provider),
  );
  const modelName = card?.displayName || routing.model;

  return (
    <Tooltip
      title={
        <Flexbox gap={2}>
          <Text>
            {t(`ModelSwitchPanel.autoRouting.difficulty.${routing.difficulty}`)}
            {' · '}
            {t(
              routing.signalSource === 'judge'
                ? 'ModelSwitchPanel.autoRouting.source.judge'
                : 'ModelSwitchPanel.autoRouting.source.heuristic',
            )}
          </Text>
          <Text>{t(`ModelSwitchPanel.autoRouting.reason.${routing.reason}`)}</Text>
        </Flexbox>
      }
    >
      <Flexbox horizontal align={'center'} gap={4} style={{ width: 'fit-content' }}>
        <ModelIcon model={routing.model} size={14} type={'mono'} />
        <Text fontSize={12} type={'secondary'}>
          {AUTO_ROUTING_TIER_NAMES[routing.tier]} · {modelName}
        </Text>
      </Flexbox>
    </Tooltip>
  );
});

AutoRouting.displayName = 'AutoRoutingExtra';

export default AutoRouting;
