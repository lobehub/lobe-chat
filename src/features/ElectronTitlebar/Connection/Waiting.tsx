'use client';

import { useWatchBroadcast } from '@lobechat/electron-client-ipc';
import { Button, Text } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

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

  helpLink: css`
    margin-inline-start: ${token.marginXXS}px;
    color: ${token.colorTextSecondary};
    text-decoration: underline;
    text-underline-offset: 2px;

    &:hover {
      color: ${token.colorText};
    }
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
  const { t } = useTranslation('electron'); // 指定 namespace 为 electron
  const [disconnect, refreshServerConfig] = useElectronStore((s) => [
    s.disconnectRemoteServer,
    s.refreshServerConfig,
  ]);

  const handleCancel = async () => {
    await disconnect();
    setWaiting(false);
  };

  useWatchBroadcast('authorizationSuccessful', async () => {
    setIsOpen(false);
    setWaiting(false);
    await refreshServerConfig();
  });

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <WaitingAnim />
        <Text as={'h4'} className={styles.title}>
          {t('waitingOAuth.title')}
        </Text>
        <Text className={styles.description}>{t('waitingOAuth.description')}</Text>
        <Button onClick={handleCancel}>{t('waitingOAuth.cancel')}</Button>{' '}
        <Text className={styles.helpText}>{t('waitingOAuth.helpText')}</Text>
      </div>
    </div>
  );
});

export default WaitingOAuth;
