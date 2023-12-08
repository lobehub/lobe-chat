import { ActionIcon, Avatar, Icon } from '@lobehub/ui';
import { Dropdown } from 'antd';
import { createStyles } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { ArrowRight, PencilRuler, Store, ToyBrick } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import PluginStore from '@/features/PluginStore';
import { useSessionStore } from '@/store/session';
import { agentSelectors } from '@/store/session/selectors';
import { pluginHelpers, useToolStore } from '@/store/tool';
import { pluginSelectors } from '@/store/tool/selectors';

import ToolItem from './ToolItem';

const useStyles = createStyles(({ css, prefixCls }) => ({
  menu: css`
    &.${prefixCls}-dropdown-menu {
      padding-block: 8px;
    }

    .${prefixCls}-dropdown-menu-item-group-list .${prefixCls}-dropdown-menu-item {
      padding: 0;
      border-radius: 4px;
    }
  `,
}));

const Tools = memo(() => {
  const { t } = useTranslation('setting');
  const list = useToolStore(pluginSelectors.installedPluginMetaList, isEqual);
  const enablePluginCount = useSessionStore((s) => agentSelectors.currentAgentPlugins(s).length);
  const [open, setOpen] = useState(false);
  const { styles } = useStyles();

  return (
    <>
      <Dropdown
        arrow={false}
        menu={{
          className: styles.menu,
          items: [
            // {
            //   children: [
            //     {
            //       icon: <Icon icon={PaletteIcon} size={{ fontSize: 16 }} style={{ padding: 4 }} />,
            //       key: 'dalle3',
            //       label: <ToolItem identifier={'dalle3'} label={'DALL·E 3'} />,
            //     },
            //   ],
            //   key: 'builtins',
            //   label: t('tools.builtins.groupName'),
            //   type: 'group',
            // },
            {
              children: [
                ...list.map((item) => ({
                  icon: item.meta?.avatar ? (
                    <Avatar avatar={pluginHelpers.getPluginAvatar(item.meta)} size={24} />
                  ) : (
                    <Icon icon={ToyBrick} size={{ fontSize: 16 }} style={{ padding: 4 }} />
                  ),
                  key: item.identifier,
                  label: (
                    <ToolItem
                      identifier={item.identifier}
                      label={pluginHelpers.getPluginTitle(item?.meta) || item.identifier}
                    />
                  ),
                })),
                {
                  icon: <Icon icon={Store} size={{ fontSize: 16 }} style={{ padding: 4 }} />,

                  key: 'plugin-store',
                  label: (
                    <Flexbox gap={40} horizontal justify={'space-between'} padding={'8px 12px'}>
                      {t('tools.plugins.store')} <Icon icon={ArrowRight} />
                    </Flexbox>
                  ),
                  onClick: (e) => {
                    e.domEvent.stopPropagation();
                    setOpen(true);
                  },
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
        <ActionIcon icon={PencilRuler} placement={'bottom'} title={t('tools.title')} />
      </Dropdown>
      <PluginStore open={open} setOpen={setOpen} />
    </>
  );
});

export default Tools;
