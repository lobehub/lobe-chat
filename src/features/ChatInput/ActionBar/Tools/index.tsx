import { ActionIcon } from '@lobehub/ui';
import { Blocks, LucideLoader2 } from 'lucide-react';
import { Suspense, memo } from 'react';
import { useTranslation } from 'react-i18next';

import { useModelSupportToolUse } from '@/hooks/useModelSupportToolUse';
import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/selectors';
import { featureFlagsSelectors, useServerConfigStore } from '@/store/serverConfig';

import DropdownMenu from './Dropdown';

const Tools = memo(() => {
  const { t } = useTranslation('setting');
  const { enablePlugins } = useServerConfigStore(featureFlagsSelectors);

  const model = useAgentStore(agentSelectors.currentAgentModel);
  const provider = useAgentStore(agentSelectors.currentAgentModelProvider);

  const enableFC = useModelSupportToolUse(model, provider);

  return (
    enablePlugins && (
      <Suspense fallback={<ActionIcon icon={LucideLoader2} spin />}>
        <DropdownMenu disabled={!enableFC}>
          <ActionIcon
            disabled={!enableFC}
            icon={Blocks}
            title={t(enableFC ? 'tools.title' : 'tools.disabled')}
            tooltipProps={{
              placement: 'bottom',
            }}
          />
        </DropdownMenu>
      </Suspense>
    )
  );
});

export default Tools;
