import { ActionIcon, Button, Dropdown, Icon } from '@lobehub/ui';
import { App } from 'antd';
import { MoreVerticalIcon, Trash2 } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/selectors';
import { useToolStore } from '@/store/tool';
import { mcpStoreSelectors, pluginSelectors } from '@/store/tool/selectors';

interface ActionsProps {
  identifier: string;
}

const Actions = memo<ActionsProps>(({ identifier }) => {
  const [installed, installing, unInstallPlugin, installMCPPlugin, cancelInstallMCPPlugin] =
    useToolStore((s) => [
      pluginSelectors.isPluginInstalled(identifier)(s),
      mcpStoreSelectors.isMCPInstalling(identifier)(s),
      s.uninstallPlugin,
      s.installMCPPlugin,
      s.cancelInstallMCPPlugin,
    ]);

  const { t } = useTranslation('plugin');
  const [togglePlugin, isPluginEnabledInAgent] = useAgentStore((s) => [
    s.togglePlugin,
    agentSelectors.currentAgentPlugins(s).includes(identifier),
  ]);
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
                    onOk: async () => {
                      // If plugin is enabled in current agent, disable it first
                      if (isPluginEnabledInAgent) {
                        await togglePlugin(identifier, false);
                      }
                      await unInstallPlugin(identifier);
                    },
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
          <ActionIcon
            icon={MoreVerticalIcon}
            loading={installing}
            onClick={(e) => {
              e.stopPropagation();
            }}
          />
        </Dropdown>
      ) : installing ? (
        <Button
          onClick={async (e) => {
            e.stopPropagation();
            await cancelInstallMCPPlugin(identifier);
          }}
          variant={'filled'}
        >
          {t('store.actions.cancel')}
        </Button>
      ) : (
        <Button
          onClick={async (e) => {
            e.stopPropagation();

            const isSuccess = await installMCPPlugin(identifier);

            if (isSuccess) {
              await togglePlugin(identifier);
            }
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
