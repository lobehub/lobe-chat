import { ActionIcon } from '@lobehub/ui';
import { Dropdown } from 'antd';
import { createStyles } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { BrainCog } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { ModelItemRender, ProviderItemRender } from 'src/components/ModelSelect';

import { useGlobalStore } from '@/store/global';
import { modelProviderSelectors } from '@/store/global/selectors';
import { useSessionStore } from '@/store/session';
import { agentSelectors } from '@/store/session/selectors';

const useStyles = createStyles(({ css, prefixCls }) => ({
  menu: css`
    .${prefixCls}-dropdown-menu-item {
      display: flex;
      gap: 8px;
    }
    .${prefixCls}-dropdown-menu {
      &-item-group-title {
        padding-inline: 8px;
      }

      &-item-group-list {
        margin: 0 !important;
      }
    }
  `,
}));

const ModelSwitch = memo(() => {
  const { t } = useTranslation('chat');
  const { styles } = useStyles();
  const model = useSessionStore(agentSelectors.currentAgentModel);
  const updateAgentConfig = useSessionStore((s) => s.updateAgentConfig);

  const select = useGlobalStore(modelProviderSelectors.modelSelectList, isEqual);

  return (
    <Dropdown
      menu={{
        activeKey: model,
        className: styles.menu,
        items: select.map((provider) => ({
          children: provider.chatModels
            .filter((c) => !c.hidden)
            .map((model) => ({
              key: model.id,
              label: <ModelItemRender {...model} />,
              onClick: () => {
                updateAgentConfig({ model: model.id, provider: provider?.id });
              },
            })),

          key: provider.id,
          label: <ProviderItemRender provider={provider.id} />,
          type: 'group',
        })),
        style: {
          maxHeight: 500,
          overflowY: 'scroll',
        },
      }}
      trigger={['click']}
    >
      <ActionIcon icon={BrainCog} placement={'bottom'} title={t('ModelSwitch.title')} />
    </Dropdown>
  );
});

export default ModelSwitch;
