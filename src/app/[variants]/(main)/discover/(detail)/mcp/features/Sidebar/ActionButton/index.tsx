'use client';

import { Icon } from '@lobehub/ui';
import { Button, message } from 'antd';
import { createStyles } from 'antd-style';
import { Trash2Icon } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import MCPInstallProgress from '@/features/MCP/MCPInstallProgress';
import { useDetailContext } from '@/features/MCPPluginDetail/DetailProvider';
import { useMarketAuth } from '@/layout/AuthProvider/MarketAuth';
import { resolveMarketAuthError } from '@/layout/AuthProvider/MarketAuth/errors';
import { useToolStore } from '@/store/tool';
import { pluginSelectors } from '@/store/tool/slices/plugin/selectors';

const useStyles = createStyles(({ css }) => ({
  button: css`
    button {
      width: 100%;
    }
  `,
}));

const ActionButton = memo(() => {
  const { t } = useTranslation(['discover', 'plugin']);
  const { t: tMarketAuth } = useTranslation('marketAuth');
  const detailContext = useDetailContext();
  const { identifier, haveCloudEndpoint } = detailContext;
  const { styles } = useStyles();
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated, isLoading: isAuthLoading, signIn } = useMarketAuth();

  const [installed, installMCPPlugin, uninstallMCPPlugin] = useToolStore((s) => [
    pluginSelectors.isPluginInstalled(identifier!)(s),
    s.installMCPPlugin,
    s.uninstallMCPPlugin,
  ]);

  // Check if this is a cloud MCP plugin
  const isCloudMcp = haveCloudEndpoint;

  const installPlugin = async () => {
    if (!identifier) return;

    // If this is a cloud MCP and user is not authenticated, request authorization first
    if (isCloudMcp && !isAuthenticated) {
      console.log(
        '[MCPActionButton] Cloud MCP detected, user not authenticated, starting authorization',
      );

      try {
        message.loading({ content: tMarketAuth('messages.loading'), key: 'market-auth' });
        await signIn();
        message.success({
          content: tMarketAuth('messages.success.cloudMcpInstall'),
          key: 'market-auth',
        });
        console.log('[MCPActionButton] Authorization successful, proceeding with installation');
      } catch (error) {
        console.error('[MCPActionButton] Authorization failed:', error);
        const normalizedError = resolveMarketAuthError(error);
        message.error({
          content: tMarketAuth(`errors.${normalizedError.code}`),
          key: 'market-auth',
        });
        return; // Don't proceed with installation if auth fails
      }
    }

    // Proceed with installation
    setIsLoading(true);
    try {
      await installMCPPlugin(identifier);
    } finally {
      setIsLoading(false);
    }
  };

  const buttonLoading = isLoading || isAuthLoading;

  return installed ? (
    <Flexbox gap={8} horizontal>
      <Button
        block
        className={styles.button}
        disabled={buttonLoading}
        size={'large'}
        type={'default'}
      >
        {t('plugins.installed')}
      </Button>

      <Button
        icon={<Icon icon={Trash2Icon} size={20} />}
        loading={buttonLoading}
        onClick={async () => {
          setIsLoading(true);
          await uninstallMCPPlugin(identifier!);
          setIsLoading(false);
        }}
        size={'large'}
        style={{ minWidth: 45 }}
        styles={{
          icon: { height: 20 },
        }}
      />
    </Flexbox>
  ) : (
    <>
      <Button
        block
        className={styles.button}
        loading={buttonLoading}
        onClick={installPlugin}
        size={'large'}
        type={'primary'}
      >
        {t('plugins.install')}
      </Button>
      <MCPInstallProgress identifier={identifier!} />
    </>
  );
});

export default ActionButton;
