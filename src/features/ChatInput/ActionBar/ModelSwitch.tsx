import { ActionIcon } from '@lobehub/ui';
import { Dropdown } from 'antd';
import { createStyles } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { BrainCog } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import ModelIcon from '@/components/ModelIcons';
import ModelProviderIcon from '@/components/ModelProviderIcons';
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
  `,
}));

const ModelSwitch = memo(() => {
  const { t } = useTranslation('chat');
  const { styles } = useStyles();
  const [model, updateAgentConfig] = useSessionStore((s) => {
    return [agentSelectors.currentAgentModel(s), s.updateAgentConfig];
  });
  const select = useGlobalStore(modelProviderSelectors.modelSelectList, isEqual);

  return (
    <Dropdown
      menu={{
        activeKey: model,
        className: styles.menu,
        items: select.map((provider) => ({
          children: provider.chatModels.map((model) => ({
            icon: <ModelIcon model={model.id} size={20} />,
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
              {t(`ModelSwitch.provider.${provider.id}` as any)}
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
      <ActionIcon icon={BrainCog} placement={'bottom'} title={t('ModelSwitch.title')} />
    </Dropdown>
  );
});

export default ModelSwitch;
