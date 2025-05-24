'use client';

import { useWatchBroadcast } from '@lobechat/electron-client-ipc';
import { Button, Icon } from '@lobehub/ui';
import { Typography } from 'antd';
import { createStyles, cx, keyframes } from 'antd-style';
import { WifiIcon } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { useElectronStore } from '@/store/electron';

const { Text, Title } = Typography;

const airdropPulse = keyframes`
    0% {
      transform: translate(-50%, -50%) scale(0.8);
      opacity: 0.5;
    }
    100% {
      transform: translate(-50%, -50%) scale(2.5);
      opacity: 0;
    }
`;

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
  // 新增：图标和脉冲动画的容器
  iconContainer: css`
    position: relative;

    display: flex;
    align-items: center;
    justify-content: center;

    width: 160px;
    height: 160px;
    margin-block-end: ${token.marginXL}px;
  `,

  // 新增：不同延迟的脉冲动画
  pulse1: css`
    animation: ${airdropPulse} 3s ease-out infinite;
  `,

  pulse2: css`
    animation: ${airdropPulse} 3s ease-out 1.2s infinite;
  `,

  pulse3: css`
    animation: ${airdropPulse} 3s ease-out 1.8s infinite;
  `,
  // 新增：基础脉冲样式
  pulseBase: css`
    pointer-events: none;
    content: '';

    position: absolute;
    inset-block-start: 50%;
    inset-inline-start: 50%;
    transform: translate(-50%, -50%);

    width: 100px;
    height: 100px;
    border-radius: 50%;

    opacity: 0;
    background-color: ${token.colorPrimaryBgHover};
  `,

  // 新增：Radar 图标样式
  radarIcon: css`
    z-index: 1;
    color: ${token.colorPrimary};
  `,

  ring1: css`
    width: 80px;
    height: 80px;
    border: 1px solid ${token.colorText};
  `,

  ring2: css`
    width: 120px;
    height: 120px;
    border: 1px solid ${token.colorTextQuaternary};
  `,

  ring3: css`
    width: 160px;
    height: 160px;
    border: 1px solid ${token.colorFillSecondary};
  `,

  // 新增：星环基础样式
  ringBase: css`
    pointer-events: none;

    position: absolute;
    inset-block-start: 50%;
    inset-inline-start: 50%;
    transform: translate(-50%, -50%);

    border-radius: 50%;
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
        {/* 更新为新的图标和脉冲动画结构 */}
        <div className={styles.iconContainer}>
          {/* 新增：星环 */}
          <div className={cx(styles.ringBase, styles.ring1)} />
          <div className={cx(styles.ringBase, styles.ring2)} />
          <div className={cx(styles.ringBase, styles.ring3)} />
          {/* 脉冲 */}
          <div className={cx(styles.pulseBase, styles.pulse1)} />
          <div className={cx(styles.pulseBase, styles.pulse2)} />
          <div className={cx(styles.pulseBase, styles.pulse3)} />

          <Icon className={styles.radarIcon} icon={WifiIcon} size={40} />
        </div>
        <Title className={styles.title} level={4}>
          {t('waitingOAuth.title')}
        </Title>
        <Text className={styles.description}>{t('waitingOAuth.description')}</Text>
        <Button onClick={handleCancel}>{t('waitingOAuth.cancel')}</Button>{' '}
        <Text className={styles.helpText}>{t('waitingOAuth.helpText')}</Text>
      </div>
    </div>
  );
});

export default WaitingOAuth;
