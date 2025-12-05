import { Blocks } from 'lucide-react';
import { Suspense, memo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import PluginStore from '@/features/PluginStore';
import { useModelSupportToolUse } from '@/hooks/useModelSupportToolUse';
import { useAgentStore } from '@/store/agent';
import { agentByIdSelectors } from '@/store/agent/selectors';
import { featureFlagsSelectors, useServerConfigStore } from '@/store/serverConfig';

import { useAgentId } from '../../hooks/useAgentId';
import Action from '../components/Action';
import { useControls } from './useControls';

const Tools = memo(() => {
  const { t } = useTranslation('setting');
  const [modalOpen, setModalOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const items = useControls({ setModalOpen, setUpdating });
  const { enablePlugins } = useServerConfigStore(featureFlagsSelectors);

  const agentId = useAgentId();
  const model = useAgentStore((s) => agentByIdSelectors.getAgentModelById(agentId)(s));
  const provider = useAgentStore((s) => agentByIdSelectors.getAgentModelProviderById(agentId)(s));

  const enableFC = useModelSupportToolUse(model, provider);

  if (!enablePlugins) return null;
  if (!enableFC)
    return <Action disabled icon={Blocks} showTooltip={true} title={t('tools.disabled')} />;

  return (
    <Suspense fallback={<Action disabled icon={Blocks} title={t('tools.title')} />}>
      <Action
        dropdown={{
          maxHeight: 500,
          maxWidth: 480,
          menu: { items },
          minWidth: 320,
        }}
        icon={Blocks}
        loading={updating}
        showTooltip={false}
        title={t('tools.title')}
      />
      <PluginStore open={modalOpen} setOpen={setModalOpen} />
    </Suspense>
  );
});

export default Tools;
