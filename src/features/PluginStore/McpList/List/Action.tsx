import { ActionIcon, Button, Dropdown, Icon } from '@lobehub/ui';
import { App } from 'antd';
import { MoreVerticalIcon, Trash2 } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useAgentStore } from '@/store/agent';
import { useToolStore } from '@/store/tool';
import { pluginSelectors, pluginStoreSelectors } from '@/store/tool/selectors';

interface ActionsProps {
  identifier: string;
}

const Actions = memo<ActionsProps>(({ identifier }) => {
  const [installed, installing, unInstallPlugin, installMCPPlugin] = useToolStore((s) => [
    pluginSelectors.isPluginInstalled(identifier)(s),
    pluginStoreSelectors.isPluginInstallLoading(identifier)(s),
    s.uninstallPlugin,
    s.installMCPPlugin,
  ]);

  const { t } = useTranslation('plugin');
  const togglePlugin = useAgentStore((s) => s.togglePlugin);
  const { modal } = App.useApp();

  return (
    <Flexbox align={'center'} horizontal>
      {installed ? (
        <Dropdown
          menu={{
            items: [
              {
                danger: true,
                icon: <Icon icon={Trash2} />,
                key: 'uninstall',
                label: t('store.actions.uninstall'),
                onClick: () => {
                  modal.confirm({
                    centered: true,
                    okButtonProps: { danger: true },
                    onOk: async () => unInstallPlugin(identifier),
                    title: t('store.actions.confirmUninstall'),
                    type: 'error',
                  });
                },
              },
            ],
          }}
          placement="bottomRight"
          trigger={['click']}
        >
          <ActionIcon icon={MoreVerticalIcon} loading={installing} />
        </Dropdown>
      ) : (
        <Button
          loading={installing}
          onClick={async () => {
            await installMCPPlugin(identifier);
            await togglePlugin(identifier);
          }}
          variant={'filled'}
        >
          {t('store.actions.install')}
        </Button>
      )}
    </Flexbox>
  );
});

export default Actions;
