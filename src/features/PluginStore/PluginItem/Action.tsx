import { ActionIcon, Icon } from '@lobehub/ui';
import { Button, Dropdown, Popconfirm } from 'antd';
import { useResponsive } from 'antd-style';
import { InfoIcon, MoreVerticalIcon, Settings, Trash2 } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import PluginDetailModal from '@/features/PluginDetailModal';
import { pluginHelpers, useToolStore } from '@/store/tool';
import { pluginSelectors, pluginStoreSelectors } from '@/store/tool/selectors';
import { LobeToolType } from '@/types/tool/tool';

import EditCustomPlugin from './EditCustomPlugin';

interface ActionsProps {
  identifier: string;
  type: LobeToolType;
}

const Actions = memo<ActionsProps>(({ identifier, type }) => {
  const [installed, installing, installPlugin, unInstallPlugin] = useToolStore((s) => [
    pluginSelectors.isPluginInstalled(identifier)(s),
    pluginStoreSelectors.isPluginInstallLoading(identifier)(s),
    s.installPlugin,
    s.uninstallPlugin,
  ]);
  const { mobile } = useResponsive();
  const isCustomPlugin = type === 'customPlugin';
  const { t } = useTranslation('plugin');
  const [open, setOpen] = useState(false);
  const plugin = useToolStore(pluginSelectors.getPluginManifestById(identifier));

  const [tab, setTab] = useState('info');
  const hasSettings = pluginHelpers.isSettingSchemaNonEmpty(plugin?.settings);

  return (
    <>
      <Flexbox align={'center'} horizontal>
        {installed ? (
          <>
            {isCustomPlugin && <EditCustomPlugin identifier={identifier} />}
            {hasSettings && (
              <ActionIcon
                icon={Settings}
                onClick={() => {
                  setOpen(true);
                  setTab('settings');
                }}
                title={t('store.actions.settings')}
              />
            )}
            <Dropdown
              menu={{
                items: [
                  {
                    icon: <Icon icon={InfoIcon} />,
                    key: 'detail',
                    label: t('store.actions.detail'),
                    onClick: () => {
                      setOpen(true);
                      setTab('info');
                    },
                  },
                  {
                    danger: true,
                    icon: <Icon icon={Trash2} />,
                    key: 'uninstall',
                    label: (
                      <Popconfirm
                        arrow={false}
                        cancelText={t('cancel', { ns: 'common' })}
                        okButtonProps={{ danger: true }}
                        okText={t('ok', { ns: 'common' })}
                        onConfirm={() => {
                          unInstallPlugin(identifier);
                        }}
                        placement={'topRight'}
                        title={t('store.actions.confirmUninstall')}
                      >
                        {t('store.actions.uninstall')}
                      </Popconfirm>
                    ),
                  },
                ],
              }}
              placement="bottomRight"
              trigger={['click']}
            >
              <ActionIcon icon={MoreVerticalIcon} loading={installing} />
            </Dropdown>
          </>
        ) : (
          <Button
            loading={installing}
            onClick={() => {
              installPlugin(identifier);
            }}
            size={mobile ? 'small' : undefined}
            type={'primary'}
          >
            {t('store.actions.install')}
          </Button>
        )}
      </Flexbox>
      <PluginDetailModal
        id={identifier}
        onClose={() => {
          setOpen(false);
        }}
        onTabChange={setTab}
        open={open}
        schema={plugin?.settings}
        tab={tab}
      />
    </>
  );
});

export default Actions;
