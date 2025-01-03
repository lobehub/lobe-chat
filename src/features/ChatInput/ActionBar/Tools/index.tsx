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
  const enableFC = useModelSupportToolUse(model);

  return (
    enablePlugins && (
      <Suspense fallback={<ActionIcon icon={LucideLoader2} spin />}>
        <DropdownMenu>
          <ActionIcon
            disable={!enableFC}
            icon={Blocks}
            placement={'bottom'}
            title={t(enableFC ? 'tools.title' : 'tools.disabled')}
          />
        </DropdownMenu>
      </Suspense>
    )
  );
});

export default Tools;
