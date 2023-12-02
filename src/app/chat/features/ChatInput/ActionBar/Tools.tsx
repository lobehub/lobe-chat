import { ActionIcon, Avatar, Icon } from '@lobehub/ui';
import { Checkbox, Dropdown } from 'antd';
import { createStyles } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { ArrowRight, PaletteIcon, PocketKnife, Store, ToyBrick } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { usePluginStore } from '@/store/plugin';
import { pluginSelectors } from '@/store/plugin/selectors';
import { useSessionStore } from '@/store/session';
import { agentSelectors } from '@/store/session/selectors';

const useStyles = createStyles(({ css, prefixCls }) => ({
  menu: css`
    &.${prefixCls}-dropdown-menu {
      padding-block: 8px;
    }

    .${prefixCls}-dropdown-menu-item-group-list .${prefixCls}-dropdown-menu-item {
      padding-inline: 8px;
      border-radius: 4px;
    }
  `,
}));

const ToolItem = memo<{ identifier: string; label: string }>(({ identifier, label }) => {
  const checked = useSessionStore((s) =>
    agentSelectors.currentAgentPlugins(s).includes(identifier),
  );

  return (
    <Flexbox
      gap={40}
      horizontal
      justify={'space-between'}
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      {label}
      <Checkbox
        checked={checked}
        onClick={(e) => {
          console.log(identifier);
          e.stopPropagation();
        }}
      />
    </Flexbox>
  );
});

const Tools = memo(() => {
  const { t } = useTranslation('setting');
  const list = usePluginStore(pluginSelectors.installedPlugins, isEqual);
  const enablePluginCount = useSessionStore((s) => agentSelectors.currentAgentPlugins(s).length);

  const { styles } = useStyles();

  return (
    <Dropdown
      arrow={false}
      menu={{
        className: styles.menu,
        items: [
          {
            children: [
              {
                icon: <Icon icon={PaletteIcon} size={{ fontSize: 16 }} style={{ padding: 4 }} />,
                key: 'dalle3',
                label: <ToolItem identifier={'dalle3'} label={'DALL·E 3'} />,
              },
            ],
            key: 'builtins',
            label: t('tools.builtins.groupName'),
            type: 'group',
          },
          {
            children: [
              ...list.map((item) => ({
                icon: item.meta?.avatar ? (
                  <Avatar avatar={item.meta?.avatar} size={24} />
                ) : (
                  <Icon icon={ToyBrick} size={{ fontSize: 16 }} style={{ padding: 4 }} />
                ),
                key: item.identifier,
                label: (
                  <ToolItem
                    identifier={item.identifier}
                    label={item.meta?.title || item.identifier}
                  />
                ),
              })),
              {
                icon: <Icon icon={Store} size={{ fontSize: 16 }} style={{ padding: 4 }} />,

                key: 'plugin-store',
                label: (
                  <Flexbox gap={40} horizontal justify={'space-between'}>
                    {t('tools.plugins.store')} <Icon icon={ArrowRight} />
                  </Flexbox>
                ),
              },
            ],
            key: 'plugins',
            label: (
              <Flexbox align={'center'} gap={40} horizontal justify={'space-between'}>
                {t('tools.plugins.groupName')}
                {enablePluginCount === 0 ? null : (
                  <div style={{ fontSize: 12, marginInlineEnd: 4 }}>
                    {t('tools.plugins.enabled', { num: enablePluginCount })}
                  </div>
                )}
              </Flexbox>
            ),
            type: 'group',
          },
        ],
        onClick: (e) => {
          e.domEvent.preventDefault();
        },
      }}
      placement={'topLeft'}
      trigger={['click']}
    >
      <ActionIcon icon={PocketKnife} placement={'bottom'} title={t('tools.title')} />
    </Dropdown>
  );
});

export default Tools;
