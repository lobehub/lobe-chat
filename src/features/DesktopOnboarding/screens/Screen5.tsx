import { useWatchBroadcast } from '@lobechat/electron-client-ipc';
import { createStyles } from 'antd-style';
import { Cloud, Server } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';

import { useElectronStore } from '@/store/electron';

import { AuthResult } from '../common/AuthResult';
import { LogoBrand } from '../common/LogoBrand';
import { TitleSection } from '../common/TitleSection';
import { useLayoutStyles } from '../styles';
import { getThemeToken } from '../styles/theme';

const themeToken = getThemeToken();

// Screen4 特有的样式
const useScreen4Styles = createStyles(({ token, css }) => ({
  // 授权说明文字
  authDescription: css`
    font-size: ${token.fontSize}px;
    color: rgba(255, 255, 255, 0.6);
    margin: 0;
    margin-bottom: 32px;
    text-align: center;
  `,

  // 内容区容器
  contentContainer: css`
    display: flex;
    flex-direction: column;
    align-items: center;
  `,

  // 禁用状态按钮样式
  disabledButton: css`
    opacity: 0.5;
    cursor: not-allowed;
  `,

  // Endpoint输入框
  endpointInput: css`
    width: 100%;
    padding: 12px 16px;
    margin: 16px 0;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: ${token.borderRadius}px;
    color: ${token.colorTextBase};
    font-size: ${token.fontSize}px;
    outline: none;

    &:focus {
      background: rgba(255, 255, 255, 0.08);
      border-color: rgba(255, 255, 255, 0.2);
    }
  `,

  errorText: css`
    font-size: ${token.fontSizeSM}px;
    color: ${token.colorError};
    margin: 0;
    margin-top: 16px;
    max-width: 520px;
    text-align: center;
    white-space: pre-wrap;
    word-break: break-word;
  `,

  // 加载状态按钮样式
  loadingButton: css`
    opacity: 0.7;
    cursor: not-allowed;
  `,

  loginContentBody: css`
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    min-width: 500px;
  `,

  loginContentHeader: css`
    display: flex;
    flex-direction: column;
    align-items: center;
  `,

  // 登录内容包装器（固定高度）
  loginContentWrapper: css`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 360px;
    width: 100%;
    position: relative;
  `,

  // 登录方式选项卡片
  methodCard: css`
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    min-width: 140px;

    svg {
      color: rgba(255, 255, 255, 0.7);
    }

    &:hover {
      background: rgba(255, 255, 255, 0.05);
      border-color: rgba(255, 255, 255, 0.2);
      transform: translateY(-1px);

      svg {
        color: rgba(255, 255, 255, 0.9);
      }
    }

    &.active {
      background: rgba(255, 255, 255, 0.08);
      border-color: rgba(255, 255, 255, 0.3);

      svg {
        color: rgba(255, 255, 255, 1);
      }

      span {
        color: rgba(255, 255, 255, 1);
      }
    }
  `,

  // 方法卡片文字
  methodCardText: css`
    font-size: ${token.fontSize}px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
    white-space: nowrap;
  `,

  // 登录方式选项容器
  methodOptions: css`
    display: flex;
    gap: 12px;
    justify-content: center;
    width: 100%;
  `,

  // 登录方式选择区域
  methodSelector: css`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    margin-top: 48px;
    width: 100%;
  `,

  // 登录方式标题
  methodSelectorTitle: css`
    font-size: ${token.fontSize}px;
    color: rgba(255, 255, 255, 0.6);
    margin-bottom: 8px;
  `,

  // 服务名称标题
  serviceTitle: css`
    font-family: ${token.fontFamily};
    font-size: 32px;
    font-weight: 500;
    color: ${token.colorTextBase};
    margin: 16px 0;
    margin-bottom: 8px;
  `,

  // 登录按钮
  signInButton: css`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 12px 32px;
    background: ${themeToken.colorHighlight};
    border: none;
    border-radius: ${token.borderRadius}px;
    color: #000;
    font-size: ${token.fontSize}px;
    font-weight: 700;
    cursor: pointer;

    &:hover {
      background: ${themeToken.colorHighlightHover};
      transform: translateY(-1px);
    }

    &:active {
      transform: translateY(0);
    }
  `,
}));

// 登录方式类型
type LoginMethod = 'cloud' | 'selfhost';

// 登录状态类型
type LoginStatus = 'idle' | 'loading' | 'success' | 'error';

// 登录方式配置
const loginMethods = {
  cloud: {
    description: 'Authorization by Official cloud-based version',
    icon: Cloud,
    id: 'cloud' as LoginMethod,
    name: 'LobeHub Cloud',
  },
  selfhost: {
    description: 'Connect to your own LobeHub server instance',
    icon: Server,
    id: 'selfhost' as LoginMethod,
    name: 'Self-hosted Instance',
  },
};

interface Screen5Props {
  onScreenConfigChange?: (config: {
    background?: {
      animate?: boolean;
      animationDelay?: number;
      animationDuration?: number;
    };
    navigation: {
      animate?: boolean;
      animationDelay?: number;
      animationDuration?: number;
      nextButtonText?: string;
      prevButtonText?: string;
      showNextButton?: boolean;
      showPrevButton?: boolean;
    };
  }) => void;
}

export const Screen5 = ({ onScreenConfigChange }: Screen5Props) => {
  const [currentMethod, setCurrentMethod] = useState<LoginMethod>('cloud');
  const [endpoint, setEndpoint] = useState('');
  const [cloudLoginStatus, setCloudLoginStatus] = useState<LoginStatus>('idle');
  const [selfhostLoginStatus, setSelfhostLoginStatus] = useState<LoginStatus>('idle');
  const [remoteError, setRemoteError] = useState<string | null>(null);

  const [
    dataSyncConfig,
    isConnectingServer,
    remoteServerSyncError,
    useDataSyncConfig,
    connectRemoteServer,
    refreshServerConfig,
    clearRemoteServerSyncError,
  ] = useElectronStore((s) => [
    s.dataSyncConfig,
    s.isConnectingServer,
    s.remoteServerSyncError,
    s.useDataSyncConfig,
    s.connectRemoteServer,
    s.refreshServerConfig,
    s.clearRemoteServerSyncError,
  ]);

  // Ensure remote server config is loaded early (desktop only hook)
  useDataSyncConfig();

  const isCloudAuthed = !!dataSyncConfig?.active && dataSyncConfig.storageMode === 'cloud';
  const isSelfHostAuthed = !!dataSyncConfig?.active && dataSyncConfig.storageMode === 'selfHost';

  // 判断是否可以开始使用
  const canStart = () => {
    switch (currentMethod) {
      case 'cloud': {
        return isCloudAuthed || cloudLoginStatus === 'success';
      }
      case 'selfhost': {
        return isSelfHostAuthed || selfhostLoginStatus === 'success';
      }
      default: {
        return false;
      }
    }
  };

  // 屏幕特定的配置
  const CONFIG = {
    screenConfig: {
      navigation: {
        animate: false,
        nextButtonDisabled: !canStart(),
        nextButtonHighlight: true,
        nextButtonText: 'Start Using LobeHub',
        showNextButton: true,
        showPrevButton: true,
      },
    },
  };

  // 通知父组件屏幕配置
  useEffect(() => {
    if (onScreenConfigChange) {
      onScreenConfigChange(CONFIG.screenConfig);
    }
  }, [onScreenConfigChange, currentMethod, cloudLoginStatus, selfhostLoginStatus]);

  const { styles: layoutStyles } = useLayoutStyles();
  const { styles: screen4Styles } = useScreen4Styles();

  // 处理登录方式切换
  const handleMethodChange = (method: LoginMethod) => {
    setCurrentMethod(method);
    setEndpoint(''); // 重置endpoint
    // 重置登录状态
    setCloudLoginStatus('idle');
    setSelfhostLoginStatus('idle');
    setRemoteError(null);
    clearRemoteServerSyncError();
  };

  // 处理云端登录
  const handleCloudLogin = async () => {
    // Desktop runtime guard
    if (process.env.NEXT_PUBLIC_IS_DESKTOP_APP !== '1') {
      setRemoteError('OIDC authorization is only available in the desktop app runtime.');
      setCloudLoginStatus('error');
      return;
    }

    setRemoteError(null);
    clearRemoteServerSyncError();
    setCloudLoginStatus('loading');
    await connectRemoteServer({ storageMode: 'cloud' });
  };

  // 处理自建服务器连接
  const handleSelfhostConnect = async () => {
    // Desktop runtime guard
    if (process.env.NEXT_PUBLIC_IS_DESKTOP_APP !== '1') {
      setRemoteError('OIDC authorization is only available in the desktop app runtime.');
      setSelfhostLoginStatus('error');
      return;
    }

    const url = endpoint.trim();
    if (!url) return;

    setRemoteError(null);
    clearRemoteServerSyncError();
    setSelfhostLoginStatus('loading');
    await connectRemoteServer({ remoteServerUrl: url, storageMode: 'selfHost' });
  };

  // 返回到登录界面
  const handleReturnToLogin = () => {
    setRemoteError(null);
    clearRemoteServerSyncError();
    switch (currentMethod) {
      case 'cloud': {
        setCloudLoginStatus('idle');
        break;
      }
      case 'selfhost': {
        setSelfhostLoginStatus('idle');
        break;
      }
    }
  };

  // Sync local UI status with real remote config
  useEffect(() => {
    if (isCloudAuthed) setCloudLoginStatus('success');
    if (isSelfHostAuthed) setSelfhostLoginStatus('success');
  }, [isCloudAuthed, isSelfHostAuthed]);

  // Surface requestAuthorization errors reported via store
  useEffect(() => {
    const message = remoteServerSyncError?.message;
    if (!message) return;
    setRemoteError(message);
    if (cloudLoginStatus === 'loading') setCloudLoginStatus('error');
    if (selfhostLoginStatus === 'loading') setSelfhostLoginStatus('error');
  }, [remoteServerSyncError?.message, cloudLoginStatus, selfhostLoginStatus]);

  // Watch broadcasts from main process (polling result)
  useWatchBroadcast('authorizationSuccessful', async () => {
    setRemoteError(null);
    clearRemoteServerSyncError();
    await refreshServerConfig();
  });

  useWatchBroadcast('authorizationFailed', ({ error }) => {
    setRemoteError(error);
    if (cloudLoginStatus === 'loading') setCloudLoginStatus('error');
    if (selfhostLoginStatus === 'loading') setSelfhostLoginStatus('error');
  });

  // 判断是否应该显示登录结果（隐藏下拉菜单）
  const shouldShowResult = () => {
    switch (currentMethod) {
      case 'cloud': {
        return cloudLoginStatus === 'success' || cloudLoginStatus === 'error';
      } // 成功或失败都隐藏下拉菜单
      case 'selfhost': {
        return selfhostLoginStatus === 'success' || selfhostLoginStatus === 'error';
      } // 成功或失败都隐藏下拉菜单
      default: {
        return false;
      }
    }
  };

  // 渲染不同登录方式的内容
  const renderLoginContent = () => {
    const method = loginMethods[currentMethod];

    switch (currentMethod) {
      case 'cloud': {
        // 如果已有登录结果，显示结果页面
        if (cloudLoginStatus === 'success') {
          return <AuthResult animated={true} key="cloud-result" success={true} />;
        }

        // 如果登录失败，显示失败结果但允许重新登录
        if (cloudLoginStatus === 'error') {
          return (
            <>
              <AuthResult animated={true} key="cloud-error" success={false} />
              {remoteError && <p className={screen4Styles.errorText}>{remoteError}</p>}
              {/* 重新登录按钮 */}
              <motion.button
                animate={{ opacity: 1, y: 0 }}
                className={`${screen4Styles.signInButton}`}
                initial={{ opacity: 0, y: 30 }}
                key="cloud-retry"
                onClick={handleReturnToLogin}
                transition={{ delay: 0.3, duration: 0.5 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Try Again
              </motion.button>
            </>
          );
        }

        return (
          <>
            {/* LobeHub Logo 品牌 */}
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className={screen4Styles.loginContentHeader}
              initial={{ opacity: 0, y: 30 }}
              key="cloud-logo"
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <LogoBrand animated={false} logoSize={200} spacing={-20} textHeight={56} />
            </motion.div>

            {/* 授权说明 */}
            <motion.p
              animate={{ opacity: 1, y: 0 }}
              className={screen4Styles.authDescription}
              initial={{ opacity: 0, y: 30 }}
              key="cloud-desc"
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              {method.description}
            </motion.p>

            {/* 登录按钮 */}
            <motion.button
              animate={{ opacity: 1, y: 0 }}
              className={`${screen4Styles.signInButton} ${cloudLoginStatus === 'loading' ? screen4Styles.loadingButton : ''}`}
              disabled={cloudLoginStatus === 'loading' || isConnectingServer}
              initial={{ opacity: 0, y: 30 }}
              key="cloud-button"
              onClick={handleCloudLogin}
              transition={{ delay: 0.5, duration: 0.5 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {cloudLoginStatus === 'loading' ? 'Signing in...' : 'Sign in to LobeHub Cloud'}
            </motion.button>
          </>
        );
      }

      case 'selfhost': {
        // 如果连接成功，显示成功结果页面
        if (selfhostLoginStatus === 'success') {
          return <AuthResult animated={true} key="selfhost-result" success={true} />;
        }

        // 如果连接失败，显示失败结果但允许重新连接
        if (selfhostLoginStatus === 'error') {
          return (
            <>
              <AuthResult animated={true} key="selfhost-error" success={false} />
              {remoteError && <p className={screen4Styles.errorText}>{remoteError}</p>}
              {/* 重新连接按钮 */}
              <motion.button
                animate={{ opacity: 1, y: 0 }}
                className={`${screen4Styles.signInButton}`}
                initial={{ opacity: 0, y: 30 }}
                key="selfhost-retry"
                onClick={handleReturnToLogin}
                transition={{ delay: 0.3, duration: 0.5 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Try Again
              </motion.button>
            </>
          );
        }

        return (
          <>
            {/* Self-host 图标和标题 */}
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className={screen4Styles.loginContentHeader}
              initial={{ opacity: 0, y: 30 }}
              key="selfhost-header"
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <Server color={themeToken.colorGreen} size={80} />
              <h2 className={screen4Styles.serviceTitle}>{method.name}</h2>
              <p className={screen4Styles.authDescription}>{method.description}</p>
            </motion.div>

            {/* Endpoint 输入框 */}
            <div className={screen4Styles.loginContentBody}>
              <motion.input
                animate={{ opacity: 1, y: 0 }}
                className={screen4Styles.endpointInput}
                disabled={selfhostLoginStatus === 'loading'}
                initial={{ opacity: 0, y: 30 }}
                key="selfhost-input"
                onChange={(e) => setEndpoint(e.target.value)}
                placeholder="Endpoint URL (Example: https://your-server.com)"
                transition={{ delay: 0.5, duration: 0.5 }}
                type="text"
                value={endpoint}
              />

              <motion.button
                animate={{ opacity: 1, y: 0 }}
                className={`${screen4Styles.signInButton} ${
                  selfhostLoginStatus === 'loading'
                    ? screen4Styles.loadingButton
                    : !endpoint.trim()
                      ? screen4Styles.disabledButton
                      : ''
                }`}
                disabled={
                  !endpoint.trim() || selfhostLoginStatus === 'loading' || isConnectingServer
                }
                initial={{ opacity: 0, y: 30 }}
                key="selfhost-button"
                onClick={handleSelfhostConnect}
                transition={{ delay: 0.6, duration: 0.5 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {selfhostLoginStatus === 'loading' ? 'Connecting...' : 'Connect to Server'}
              </motion.button>
            </div>
          </>
        );
      }

      default: {
        return null;
      }
    }
  };

  return (
    <div className={layoutStyles.fullScreen}>
      {/* 内容层 */}
      <div className={layoutStyles.centered}>
        {/* 标题部分 */}
        <TitleSection
          animated={true}
          badge="Sign in"
          description="Sign in to sync your AI agents, settings, and conversations across all devices."
          title="Connect Your Account"
        />

        {/* 登录区域 */}
        <div className={screen4Styles.contentContainer}>
          {/* 登录内容包装器 - 固定高度 */}
          <div className={screen4Styles.loginContentWrapper}>{renderLoginContent()}</div>

          {/* 登录方式选择 - 只在没有登录结果时显示 */}
          {!shouldShowResult() && (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className={screen4Styles.methodSelector}
              initial={{ opacity: 0, y: 30 }}
              transition={{ delay: 0.7, duration: 0.5 }}
            >
              <div className={screen4Styles.methodOptions}>
                {Object.values(loginMethods).map((method) => (
                  <motion.div
                    className={`${screen4Styles.methodCard} ${currentMethod === method.id ? 'active' : ''}`}
                    key={method.id}
                    onClick={() => handleMethodChange(method.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {method.icon && <method.icon size={20} />}
                    <span className={screen4Styles.methodCardText}>{method.name}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};
