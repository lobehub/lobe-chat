import { ActionIcon, Icon, Tooltip } from '@lobehub/ui';
import { Dropdown } from 'antd';
import { createStyles } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { BrainCog, LucideEye, ToyBrick } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import ModelIcon from '@/components/ModelIcons';
import ModelProviderIcon from '@/components/ModelProviderIcons';
import { useGlobalStore } from '@/store/global';
import { modelProviderSelectors } from '@/store/global/selectors';
import { useSessionStore } from '@/store/session';
import { agentSelectors } from '@/store/session/selectors';

const useStyles = createStyles(({ css, token, prefixCls }) => ({
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
    cursor: default;

    display: flex;
    align-items: center;
    justify-content: center;

    width: 20px;
    height: 20px;

    border-radius: 4px;
  `,
  tagBlue: css`
    color: ${token.geekblue};
    background: ${token.geekblue1};
  `,
  tagGreen: css`
    color: ${token.green};
    background: ${token.green1};
  `,
}));

const ModelSwitch = memo(() => {
  const { t } = useTranslation('chat');
  const { styles, cx } = useStyles();
  const [model, updateAgentConfig] = useSessionStore((s) => {
    return [
      agentSelectors.currentAgentModel(s),
      s.updateAgentConfig,
      // agentSelectors.currentAgentModelProvider(s),
    ];
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
            label: (
              <Flexbox align={'center'} gap={32} horizontal justify={'space-between'}>
                {model.displayName || model.id}

                <Flexbox gap={4} horizontal>
                  {model.vision && (
                    <Tooltip placement={'right'} title={t('ModelSwitch.featureTag.vision')}>
                      <div className={cx(styles.tag, styles.tagGreen)}>
                        <Icon icon={LucideEye} />
                      </div>
                    </Tooltip>
                  )}
                  {model.functionCall && (
                    <Tooltip
                      overlayStyle={{ maxWidth: 'unset' }}
                      placement={'right'}
                      title={t('ModelSwitch.featureTag.functionCall')}
                    >
                      <div className={cx(styles.tag, styles.tagBlue)}>
                        <Icon icon={ToyBrick} />
                      </div>
                    </Tooltip>
                  )}
                </Flexbox>
              </Flexbox>
            ),
            onClick: () => {
              updateAgentConfig({ model: model.id, provider: provider?.id });
            },
          })),

          key: provider.id,
          label: (
            <Flexbox align={'center'} gap={4} horizontal>
              <ModelProviderIcon provider={provider.id} />
              {t(`ModelSwitch.provider.${provider.id}` as any)}
            </Flexbox>
          ),
          type: 'group',
          // TODO: when we have more providers, need to use this. And some more style to fix
          // type: activeProvider === provider.id ? 'group' : undefined,
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
