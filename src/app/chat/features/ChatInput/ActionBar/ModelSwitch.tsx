import { ActionIcon } from '@lobehub/ui';
import { Dropdown } from 'antd';
import { BrainCog } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { settingsSelectors, useGlobalStore } from '@/store/global';
import { useSessionStore } from '@/store/session';
import { agentSelectors } from '@/store/session/selectors';
import { LanguageModel } from '@/types/llm';

const ModelSwitch = memo(() => {
  const { t } = useTranslation('setting');

  const [model, updateAgentConfig] = useSessionStore((s) => {
    return [agentSelectors.currentAgentModel(s), s.updateAgentConfig];
  });

  const modelList = useGlobalStore(settingsSelectors.modelList);

  return (
    <Dropdown
      menu={{
        activeKey: model,
        items: modelList.map(({ name, displayName }) => ({ key: name, label: displayName })),
        onClick: (e) => {
          updateAgentConfig({ model: e.key as LanguageModel });
        },
        style: {
          maxHeight: 400,
          overflow: 'scroll',
        },
      }}
      trigger={['click']}
    >
      <ActionIcon icon={BrainCog} placement={'bottom'} title={t('settingModel.model.title')} />
    </Dropdown>
  );
});

export default ModelSwitch;
