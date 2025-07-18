'use client';

import { useWatchBroadcast } from '@lobechat/electron-client-ipc';
import { Button, Highlighter, Icon, Text } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { ShieldX } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useElectronStore } from '@/store/electron';

import WaitingAnim from './WaitingAnim';

const useStyles = createStyles(({ css, token }) => ({
  container: css`
    overflow: hidden;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    min-height: 100vh;

    color: ${token.colorTextBase};

    background-color: ${token.colorBgContainer};
  `,

  content: css`
    z-index: 10;
    display: flex;
    flex-direction: column;
    align-items: center;
  `,

  description: css`
    margin-block-end: ${token.marginXL}px !important;
    color: ${token.colorTextSecondary} !important;
  `,

  errorIcon: css`
    margin-block-end: ${token.marginXL}px;
    color: ${token.colorError};
  `,

  errorMessage: css`
    margin-block-end: ${token.marginXL}px !important;
    color: ${token.colorError} !important;
    text-align: center;
  `,

  helpText: css`
    margin-block-start: ${token.marginLG}px;
    font-size: ${token.fontSizeSM}px;
    color: ${token.colorTextTertiary};
  `,

  title: css`
    margin-block-end: ${token.marginSM}px !important;
    color: ${token.colorText} !important;
  `,
}));

interface WaitingOAuthProps {
  setIsOpen: (open: boolean) => void;
  setWaiting: (waiting: boolean) => void;
}

const WaitingOAuth = memo<WaitingOAuthProps>(({ setWaiting, setIsOpen }) => {
  const { styles } = useStyles();
  const { t } = useTranslation('electron');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [disconnect, refreshServerConfig, connectRemoteServer] = useElectronStore((s) => [
    s.disconnectRemoteServer,
    s.refreshServerConfig,
    s.connectRemoteServer,
  ]);

  const handleCancel = async () => {
    await disconnect();
    setWaiting(false);
    setErrorMessage(null);
  };

  const handleRetry = async () => {
    setErrorMessage(null);
    const { dataSyncConfig } = useElectronStore.getState();
    await connectRemoteServer(dataSyncConfig);
  };

  useWatchBroadcast('authorizationSuccessful', async () => {
    setIsOpen(false);
    setWaiting(false);
    setErrorMessage(null);
    await refreshServerConfig();
  });

  useWatchBroadcast('authorizationFailed', ({ error }) => {
    setErrorMessage(error);
  });

  // 错误状态
  if (errorMessage) {
    return (
      <div className={styles.container}>
        <Flexbox className={styles.content} gap={12}>
          <Flexbox align={'center'}>
            <Icon className={styles.errorIcon} icon={ShieldX} size={64} />
            <Text as={'h4'} className={styles.title}>
              {t('waitingOAuth.errorTitle')}
            </Text>
          </Flexbox>
          <Highlighter language={'log'} style={{ maxHeight: 500, maxWidth: 800, overflow: 'auto' }}>
            {errorMessage}
          </Highlighter>
          <Flexbox gap={12} horizontal>
            <Button onClick={handleCancel}>{t('waitingOAuth.cancel')}</Button>
            <Button onClick={handleRetry} type="primary">
              {t('waitingOAuth.retry')}
            </Button>
          </Flexbox>
        </Flexbox>
      </div>
    );
  }

  // 正常等待状态
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <WaitingAnim />
        <Text as={'h4'} className={styles.title}>
          {t('waitingOAuth.title')}
        </Text>
        <Text className={styles.description}>{t('waitingOAuth.description')}</Text>
        <Button onClick={handleCancel}>{t('waitingOAuth.cancel')}</Button>
        <Text className={styles.helpText}>{t('waitingOAuth.helpText')}</Text>
      </div>
    </div>
  );
});

export default WaitingOAuth;
