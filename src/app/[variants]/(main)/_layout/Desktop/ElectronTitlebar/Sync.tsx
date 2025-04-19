import { ActionIcon, Input } from '@lobehub/ui';
import { Button, Form, Popover } from 'antd';
import isEqual from 'fast-deep-equal';
import { Loader, Wifi, WifiOffIcon } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useElectronStore } from '@/store/electron';
import { electronSyncSelectors } from '@/store/electron/selectors';

const Sync = memo(() => {
  const { t } = useTranslation('electron');
  const [open, setOpen] = useState(false);

  const [serverUrl, setServerUrl] = useState('');

  const [
    isIniting,
    isConnectingServer,
    isSyncActive,
    useRemoteServerConfig,
    connectRemoteServer,
    disconnectRemoteServer,
  ] = useElectronStore((s) => [
    !s.isInitRemoteServerConfig,
    s.isConnectingServer,
    electronSyncSelectors.isSyncActive(s),
    s.useRemoteServerConfig,
    s.connectRemoteServer,
    s.disconnectRemoteServer,
  ]);
  const errorStatus = useElectronStore((s) => s.remoteServerSyncError, isEqual);

  // 使用useSWR获取远程服务器配置
  useRemoteServerConfig();

  return (
    <Popover
      arrow={false}
      content={
        <Flexbox gap={16} padding={16} style={{ width: 400 }}>
          <Flexbox gap={8}>
            <h3 style={{ margin: 0 }}>{t('remoteServer.configTitle')}</h3>
          </Flexbox>

          <Form
            initialValues={{ serverUrl }}
            layout={'vertical'}
            onFinish={async (values) => {
              await connectRemoteServer({ isSelfHosted: true, serverUrl: values.serverUrl });
            }}
          >
            <Form.Item
              extra={
                !!errorStatus ? (
                  <div style={{ color: 'red' }}>{t('remoteServer.fetchError')}</div>
                ) : isSyncActive ? (
                  <div>{t('remoteServer.statusConnected')}</div>
                ) : (
                  <div>{t('remoteServer.statusDisconnected')}</div>
                )
              }
              label={t('remoteServer.serverUrl')}
              name="serverUrl"
              rules={[
                { message: t('remoteServer.urlRequired'), required: true },
                {
                  message: t('remoteServer.invalidUrl'),
                  type: 'url',
                },
              ]}
            >
              <Input
                onChange={(e) => setServerUrl(e.target.value)}
                placeholder="https://your-lobehub.com"
                value={serverUrl}
              />
            </Form.Item>

            <Flexbox distribution="space-between" gap={8} horizontal>
              {isSyncActive ? (
                <Button danger loading={isConnectingServer} onClick={disconnectRemoteServer}>
                  {t('remoteServer.disconnect')}
                </Button>
              ) : (
                <Button htmlType="submit" loading={isConnectingServer} type="primary">
                  {t('remoteServer.connect')}
                </Button>
              )}
              <Button onClick={() => setOpen(false)}>{t('cancel', { ns: 'common' })}</Button>
            </Flexbox>
          </Form>
        </Flexbox>
      }
      onOpenChange={setOpen}
      open={open}
      placement="bottomRight"
      trigger="click"
    >
      <ActionIcon
        icon={isIniting ? Loader : isSyncActive ? Wifi : WifiOffIcon}
        loading={isIniting}
        placement={'bottomRight'}
        size="small"
      />
    </Popover>
  );
});

export default Sync;
