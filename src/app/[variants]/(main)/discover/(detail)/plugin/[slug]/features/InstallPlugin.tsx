'use client';

import { Button } from '@lobehub/ui';
import { App, Skeleton } from 'antd';
import { createStyles } from 'antd-style';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useFetchInstalledPlugins } from '@/hooks/useFetchInstalledPlugins';
import { useToolStore } from '@/store/tool';
import { pluginSelectors, pluginStoreSelectors } from '@/store/tool/selectors';

const useStyles = createStyles(({ css }) => ({
  button: css`
    button {
      width: 100%;
    }
  `,
}));

const InstallPlugin = memo<{ identifier: string }>(({ identifier }) => {
  const { styles } = useStyles();
  const { t } = useTranslation(['discover', 'plugin']);
  const [loading, setLoading] = useState(false);
  const { modal } = App.useApp();
  const [useFetchPluginStore, installed, installing, installPlugin, unInstallPlugin] = useToolStore(
    (s) => [
      s.useFetchPluginStore,
      pluginSelectors.isPluginInstalled(identifier)(s),
      pluginStoreSelectors.isPluginInstallLoading(identifier)(s),
      s.installPlugin,
      s.uninstallPlugin,
    ],
  );

  const { isLoading } = useFetchPluginStore();
  const { isLoading: installedPluginLoading } = useFetchInstalledPlugins();
  const loadingState = installedPluginLoading || loading;

  const handleInstall = async () => {
    setLoading(true);
    await installPlugin(identifier);
    setLoading(false);
  };

  const handleUninstall = async () => {
    modal.confirm({
      centered: true,
      okButtonProps: { danger: true },
      onOk: async () => {
        setLoading(true);
        await unInstallPlugin(identifier);
        setLoading(false);
      },
      title: t('store.actions.confirmUninstall', { ns: 'plugin' }),
      type: 'error',
    });
  };

  if (isLoading) return <Skeleton.Button block size={'large'} />;

  return (
    <Button
      className={styles.button}
      loading={loadingState}
      onClick={() => {
        if (loading || installing) return;
        if (installed) {
          handleUninstall();
        } else {
          handleInstall();
        }
      }}
      size={'large'}
      style={{ flex: 1, width: 'unset' }}
      type={installed ? 'default' : 'primary'}
    >
      {t(installed ? 'plugins.installed' : 'plugins.install')}
    </Button>
  );
});

export default InstallPlugin;
