import { Dropdown } from 'antd';
import { createStyles } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { PropsWithChildren, memo, useMemo } from 'react';

import { ModelItemRender, ProviderItemRender } from '@/components/ModelSelect';
import { useGlobalStore } from '@/store/global';
import { modelProviderSelectors } from '@/store/global/selectors';
import { useSessionStore } from '@/store/session';
import { agentSelectors } from '@/store/session/selectors';
import { ModelProviderCard } from '@/types/llm';

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
  tag: css`
    cursor: pointer;
  `,
}));

const ModelSwitchPanel = memo<PropsWithChildren>(({ children }) => {
  const { styles } = useStyles();
  const model = useSessionStore(agentSelectors.currentAgentModel);
  const updateAgentConfig = useSessionStore((s) => s.updateAgentConfig);

  const select = useGlobalStore(modelProviderSelectors.modelSelectList, isEqual);
  const enabledList = select.filter((s) => s.enabled);

  const items = useMemo(() => {
    const getModelItems = (provider: ModelProviderCard) =>
      provider.chatModels
        .filter((c) => !c.hidden)
        .map((model) => ({
          key: model.id,
          label: <ModelItemRender {...model} />,
          onClick: () => {
            updateAgentConfig({ model: model.id, provider: provider.id });
          },
        }));

    if (enabledList.length === 1) {
      const provider = enabledList[0];
      return getModelItems(provider);
    }

    return enabledList.map((provider) => ({
      children: getModelItems(provider),
      key: provider.id,
      label: <ProviderItemRender provider={provider.id} />,
      type: 'group',
    }));
  }, [enabledList]);

  return (
    <Dropdown
      menu={{
        activeKey: model,
        className: styles.menu,
        items,
        style: {
          maxHeight: 500,
          overflowY: 'scroll',
        },
      }}
      trigger={['click']}
    >
      <div className={styles.tag}>{children}</div>
    </Dropdown>
  );
});

export default ModelSwitchPanel;
