import { SlidersHorizontal } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/slices/chat';

import Action from '../components/Action';
import Controls from './Controls';

const Params = memo(() => {
  const [isLoading] = useAgentStore((s) => [agentSelectors.isAgentConfigLoading(s)]);
  const [updating, setUpdating] = useState(false);
  const { t } = useTranslation('setting');

  if (isLoading) return <Action disabled icon={SlidersHorizontal} />;

  return (
    <Action
      icon={SlidersHorizontal}
      loading={updating}
      popover={{
        content: <Controls setUpdating={setUpdating} updating={updating} />,
      }}
      showTooltip={false}
      title={t('settingModel.params.title')}
    />
  );
});

export default Params;
