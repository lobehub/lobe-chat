import { createStyles } from 'antd-style';
import { Bell, Check, FolderOpen, Mic, MonitorCog } from 'lucide-react';
import { motion } from 'motion/react';
import { useCallback, useEffect, useState } from 'react';

import { ensureElectronIpc } from '@/utils/electron/ipc';

import { TitleSection } from '../common/TitleSection';
import { useLayoutStyles } from '../styles';
import { getThemeToken } from '../styles/theme';

const themeToken = getThemeToken();

// Screen3 特有的样式
const useScreen3Styles = createStyles(({ token, css }) => ({
  // 内容区
  content: css`
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
  `,

  // 图标容器
  iconWrapper: css`
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
    background: transparent;
    flex-shrink: 0;
  `,

  // 项目描述
  itemDescription: css`
    font-size: ${token.fontSize}px;
    color: rgba(255, 255, 255, 0.6);
    margin: 0;
    line-height: 1.5;
  `,

  // 项目标题
  itemTitle: css`
    font-size: ${token.fontSizeLG}px;
    font-weight: 500;
    color: ${themeToken.colorTextBase};
    margin: 0;
  `,

  // 按钮
  permissionButton: css`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 10px 20px;
    min-width: 170px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    color: ${themeToken.colorTextBase};
    font-size: ${token.fontSize}px;
    font-weight: 700;
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.2s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.15);
      border-color: rgba(255, 255, 255, 0.3);
    }

    &:active {
      transform: scale(0.98);
    }

    &.granted {
      background: rgba(255, 255, 255, 0.03);
      border-color: rgba(255, 255, 255, 0.08);
      color: rgba(255, 255, 255, 0.4);
      cursor: not-allowed;
      opacity: 0.6;

      &:hover {
        background: rgba(255, 255, 255, 0.03);
        border-color: rgba(255, 255, 255, 0.08);
        transform: none;
      }
    }
  `,

  // 列表项
  permissionItem: css`
    display: flex;
    align-items: center;
    gap: 20px;
    padding: 20px 24px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: ${token.borderRadiusLG}px;
    backdrop-filter: blur(20px);
    transition:
      background-color 0.5s ease,
      border-color 0.5s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.08);
      border-color: rgba(255, 255, 255, 0.15);
    }
  `,

  // 列表容器
  permissionList: css`
    display: flex;
    flex-direction: column;
    gap: 12px;
    max-width: 800px;
    width: 100%;
    font-family: ${token.fontFamily};
  `,
}));

// 权限数据
const initialPermissions = [
  {
    buttonText: 'Grant Access',
    description:
      'Send system notifications for task completions, AI responses, and important updates when the app is running in background',
    granted: false,
    icon: Bell,
    iconColor: themeToken.colorYellow,
    id: 1,
    title: 'Notification Permission',
  },
  {
    buttonText: 'Grant Access',
    description:
      'Access documents and files to enable AI analysis, knowledge base creation, and document processing workflows',
    granted: false,
    icon: FolderOpen,
    iconColor: themeToken.colorGreen,
    id: 2,
    title: 'File & Folder Access',
  },
  {
    buttonText: 'Grant Access',
    description:
      'Capture screen content and audio input for voice interactions, screen analysis, and multimodal AI assistance',
    granted: false,
    icon: Mic,
    iconColor: themeToken.colorBlue,
    id: 3,
    title: 'Screen & Audio Recording',
  },
  {
    buttonText: 'Grant Access',
    description:
      'Enable system-level automation and enhanced integration for seamless AI workflow execution across applications',
    granted: false,
    icon: MonitorCog,
    iconColor: themeToken.colorPurple,
    id: 4,
    title: 'Accessibility Settings',
  },
];

interface Screen3Props {
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

export const Screen3 = ({ onScreenConfigChange }: Screen3Props) => {
  // 屏幕特定的配置
  const CONFIG = {
    screenConfig: {
      navigation: {
        animate: false,
        showNextButton: true,
        showPrevButton: true,
      },
    },
  };

  const [permissions, setPermissions] = useState(initialPermissions);

  const checkAllPermissions = useCallback(async () => {
    const ipc = ensureElectronIpc();
    if (!ipc) return;
    const state = await ipc.system.getAppState();
    const isMac = state.platform === 'darwin';
    if (!isMac) {
      // If not on macOS, assume all permissions are granted
      setPermissions((prev) => prev.map((p) => ({ ...p, granted: true })));
      return;
    }

    const notifStatus = await ipc.notification.getNotificationPermissionStatus();
    const micStatus = await ipc.system.getMediaAccessStatus('microphone');
    const screenStatus = await ipc.system.getMediaAccessStatus('screen');
    const accessibilityStatus = await ipc.system.getAccessibilityStatus();

    setPermissions((prev) =>
      prev.map((p) => {
        if (p.id === 1) return { ...p, granted: notifStatus === 'authorized' };
        // Full Disk Access cannot be checked programmatically, so it remains manual
        if (p.id === 2) return { ...p, buttonText: 'Open Settings', granted: false };
        if (p.id === 3)
          return { ...p, granted: micStatus === 'granted' && screenStatus === 'granted' };
        if (p.id === 4) return { ...p, granted: accessibilityStatus };
        return p;
      }),
    );
  }, []);

  useEffect(() => {
    checkAllPermissions();
  }, [checkAllPermissions]);

  // When this page regains focus (e.g. back from System Settings), re-check permission states and refresh UI.
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleFocus = () => {
      checkAllPermissions();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkAllPermissions();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [checkAllPermissions]);

  const handlePermissionRequest = async (permissionId: number) => {
    const ipc = ensureElectronIpc();
    if (!ipc) return;
    switch (permissionId) {
      case 1: {
        await ipc.notification.requestNotificationPermission();
        break;
      }
      case 2: {
        await ipc.system.openFullDiskAccessSettings();
        break;
      }
      case 3: {
        await ipc.system.requestMicrophoneAccess();
        await ipc.system.requestScreenAccess();
        break;
      }
      case 4: {
        await ipc.system.requestAccessibilityAccess();
        break;
      }
      default: {
        break;
      }
    }
    // Re-check permissions after a short delay to allow system dialogs
    setTimeout(() => {
      void checkAllPermissions();
    }, 1000);
  };

  // 通知父组件屏幕配置
  useEffect(() => {
    if (onScreenConfigChange) {
      onScreenConfigChange(CONFIG.screenConfig);
    }
  }, [onScreenConfigChange]);

  const { styles: layoutStyles } = useLayoutStyles();
  const { styles: screen3Styles } = useScreen3Styles();

  return (
    <div className={layoutStyles.fullScreen}>
      {/* 内容层 */}
      <div className={layoutStyles.centered}>
        {/* 标题部分 */}
        <TitleSection
          animated={true}
          badge="Permissions"
          description="Grant the following permissions to experience LobeHub's full capabilities"
          title="Enable Full Experience"
        />

        {/* 权限列表 */}
        <div className={screen3Styles.permissionList}>
          {permissions.map((permission, index) => (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className={screen3Styles.permissionItem}
              initial={{ opacity: 0, y: 50 }}
              key={permission.id}
              transition={{
                delay: 0.1 + index * 0.1,
                duration: 0.5,
                ease: [0.4, 0, 0.2, 1],
              }}
            >
              {/* 图标 */}
              <div className={screen3Styles.iconWrapper}>
                <permission.icon size={24} style={{ color: permission.iconColor }} />
              </div>

              {/* 内容 */}
              <div className={screen3Styles.content}>
                <h3 className={screen3Styles.itemTitle}>{permission.title}</h3>
                <p className={screen3Styles.itemDescription}>{permission.description}</p>
              </div>

              {/* 按钮 */}
              <button
                className={`${screen3Styles.permissionButton} ${permission.granted ? 'granted' : ''}`}
                disabled={permission.granted && permission.id !== 2}
                onClick={() => handlePermissionRequest(permission.id)}
                type="button"
              >
                {permission.granted && permission.id !== 2 ? (
                  <>
                    <Check size={16} />
                    Access Granted
                  </>
                ) : (
                  permission.buttonText
                )}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
