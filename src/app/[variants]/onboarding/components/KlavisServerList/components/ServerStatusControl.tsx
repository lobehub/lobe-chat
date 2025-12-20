import { Icon } from '@lobehub/ui';
import { useTheme } from 'antd-style';
import { CheckIcon, CircleX, Loader2 } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { KlavisServer, KlavisServerStatus } from '@/store/tool/slices/klavisStore';

interface ServerStatusControlProps {
  isConnecting: boolean;
  isWaitingAuth: boolean;
  server?: KlavisServer;
}

const ServerStatusControl = memo<ServerStatusControlProps>(
  ({ isConnecting, isWaitingAuth, server }) => {
    const { t } = useTranslation('setting');
    const theme = useTheme();

    // Loading states
    if (isConnecting || isWaitingAuth) {
      return <Icon color={theme.colorTextDescription} icon={Loader2} spin />;
    }

    // No server yet - show nothing (click to connect)
    if (!server) {
      return null;
    }

    // Server status indicators
    switch (server.status) {
      case KlavisServerStatus.CONNECTED: {
        return <Icon color={theme.colorSuccess} icon={CheckIcon} />;
      }

      case KlavisServerStatus.PENDING_AUTH: {
        return null;
      }

      case KlavisServerStatus.ERROR: {
        return (
          <Icon
            color={theme.colorError}
            icon={CircleX}
            title={t('tools.klavis.error', { defaultValue: 'Error' })}
          />
        );
      }

      default: {
        return null;
      }
    }
  },
);

ServerStatusControl.displayName = 'ServerStatusControl';

export default ServerStatusControl;
