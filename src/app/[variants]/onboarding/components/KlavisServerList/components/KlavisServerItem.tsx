'use client';

import { Block, Text } from '@lobehub/ui';
import { useTheme } from 'antd-style';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { KlavisServerType } from '@/const/index';
import { KlavisServer, KlavisServerStatus } from '@/store/tool/slices/klavisStore';

import { useKlavisOAuth } from '../hooks/useKlavisOAuth';
import { useKlavisServerActions } from '../hooks/useKlavisServerActions';
import ServerIcon from './ServerIcon';
import ServerStatusControl from './ServerStatusControl';

interface KlavisServerItemProps {
  icon: KlavisServerType['icon'];
  identifier: string;
  label: string;
  server?: KlavisServer;
  serverName: string;
}

const KlavisServerItem = memo<KlavisServerItemProps>(
  ({ identifier, label, server, serverName, icon }) => {
    const theme = useTheme();

    const { isWaitingAuth, openOAuthWindow } = useKlavisOAuth({
      serverStatus: server?.status,
    });

    const { isConnecting, handleConnect } = useKlavisServerActions({
      identifier,
      onAuthRequired: openOAuthWindow,
      server,
      serverName,
    });

    const isConnected = server?.status === KlavisServerStatus.CONNECTED;
    const isPendingAuth = server?.status === KlavisServerStatus.PENDING_AUTH;
    const isClickable = !isConnected;

    const handleItemClick = () => {
      if (isConnected) return;

      if (!server) {
        handleConnect();
      } else if (isPendingAuth && server.oauthUrl) {
        openOAuthWindow(server.oauthUrl, server.identifier);
      }
    };

    return (
      <Block
        align="center"
        clickable={isClickable}
        gap={8}
        horizontal
        justify="space-between"
        onClick={handleItemClick}
        padding={12}
        style={
          isConnected
            ? {
                background: theme.colorSuccessBg,
                borderColor: theme.colorSuccessBorder,
              }
            : {}
        }
        variant={'outlined'}
      >
        <Flexbox
          align="center"
          flex={1}
          gap={12}
          horizontal
          style={{
            overflow: 'hidden',
          }}
        >
          <ServerIcon icon={icon} label={label} />
          <Text ellipsis>{label}</Text>
        </Flexbox>

        <ServerStatusControl
          isConnecting={isConnecting}
          isWaitingAuth={isWaitingAuth}
          server={server}
        />
      </Block>
    );
  },
);

KlavisServerItem.displayName = 'KlavisServerItem';

export default KlavisServerItem;
