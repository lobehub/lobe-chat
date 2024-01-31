import { ActionIcon } from '@lobehub/ui';
import { Dropdown } from 'antd';
import isEqual from 'fast-deep-equal';
import { BrainCog } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import ModelProviderIcon from '@/components/ModelProviderIcons';
import { useGlobalStore } from '@/store/global';
import { modelProviderSelectors } from '@/store/global/selectors';
import { useSessionStore } from '@/store/session';
import { agentSelectors } from '@/store/session/selectors';

const ModelSwitch = memo(() => {
  const { t } = useTranslation('setting');

  const [model, updateAgentConfig] = useSessionStore((s) => {
    return [agentSelectors.currentAgentModel(s), s.updateAgentConfig];
  });
  const select = useGlobalStore(modelProviderSelectors.modelSelectList, isEqual);

  return (
    <Dropdown
      menu={{
        activeKey: model,
        items: select.map((provider) => ({
          children: provider.chatModels.map((model) => ({
            key: model.id,
            label: model.displayName || model.id,
            onClick: () => {
              updateAgentConfig({ model: model.id, provider: provider?.id });
            },
          })),
          key: provider.id,
          label: (
            <Flexbox align={'center'} gap={8} horizontal>
              <ModelProviderIcon provider={provider.id} />
              {provider.id}
            </Flexbox>
          ),
          type: 'group',
        })),
        style: {
          maxHeight: 700,
          overflowY: 'scroll',
        },
      }}
      trigger={['click']}
    >
      <ActionIcon icon={BrainCog} placement={'bottom'} title={t('settingModel.model.title')} />
    </Dropdown>
  );
});

export default ModelSwitch;
