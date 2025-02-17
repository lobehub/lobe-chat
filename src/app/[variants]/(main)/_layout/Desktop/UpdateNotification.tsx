import { DownloadOutlined } from '@ant-design/icons';
import { UpdateInfo, useWatchBroadcast } from '@lobechat/electron-client-ipc';
import { Icon, Markdown } from '@lobehub/ui';
import { Badge, Button, Popover, Progress, Tooltip, theme } from 'antd';
import { createStyles } from 'antd-style';
import { Download } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { autoUpdateService } from '@/services/electron/autoUpdate';
import { electronStylish } from '@/styles/electron';

const useStyles = createStyles(({ css, token, isDarkMode }) => ({
  container: css`
    cursor: pointer;

    height: 24px;
    padding-inline: 8px;
    border: 1px solid ${token.green7A};
    border-radius: 24px;

    font-size: 12px;
    line-height: 22px;
    color: ${token.green11A};

    background: ${token.green2A};
    background-color: ${isDarkMode ? token.colorFill : token.colorFillSecondary};
  `,
}));

export const UpdateNotification: React.FC = () => {
  const { t } = useTranslation('electron');
  const { styles } = useStyles();
  const { token } = theme.useToken();
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [updateDownloaded, setUpdateDownloaded] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [willInstallLater, setWillInstallLater] = useState(false);
  const [isPopoverVisible, setIsPopoverVisible] = useState(false);

  useWatchBroadcast('updateAvailable', (info: UpdateInfo) => {
    setUpdateInfo(info);
    setUpdateAvailable(true);
  });

  useWatchBroadcast('updateDownloadProgress', (progress: { percent: number }) => {
    setDownloadProgress(progress.percent);
  });

  useWatchBroadcast('updateDownloaded', (info: UpdateInfo) => {
    setUpdateInfo(info);
    setUpdateDownloaded(true);
    setUpdateAvailable(false);
  });

  useWatchBroadcast('updateWillInstallLater', () => {
    setWillInstallLater(true);
    setTimeout(() => setWillInstallLater(false), 5000); // 5秒后自动隐藏提示
  });

  // 没有更新或正在下载时不显示任何内容
  if ((!updateAvailable && !updateDownloaded) || (downloadProgress > 0 && downloadProgress < 100)) {
    return null;
  }

  // 如果正在下载，显示下载进度
  if (downloadProgress > 0 && downloadProgress < 100) {
    return (
      <div
        style={{
          position: 'fixed',
          right: 12,
          top: 12,
          zIndex: 1000,
        }}
      >
        <Tooltip title={t('updater.downloadingUpdateDesc', '正在下载更新...')}>
          <Badge
            count={<DownloadOutlined style={{ color: token.colorPrimary }} />}
            offset={[-4, 4]}
          >
            <div
              style={{
                alignItems: 'center',
                background: token.colorBgElevated,
                borderRadius: '50%',
                boxShadow: token.boxShadow,
                display: 'flex',
                height: 32,
                justifyContent: 'center',
                position: 'relative',
                width: 32,
              }}
            >
              <Progress
                percent={Math.round(downloadProgress)}
                showInfo={false}
                strokeWidth={12}
                type="circle"
                width={30}
              />
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 'bold',
                  position: 'absolute',
                }}
              >
                {Math.round(downloadProgress)}%
              </span>
            </div>
          </Badge>
        </Tooltip>
      </div>
    );
  }

  return (
    <Flexbox className={electronStylish.nodrag}>
      <Popover
        arrow={false}
        content={
          <div style={{ maxWidth: 280 }}>
            <div style={{ marginBottom: 12 }}>
              <h3 style={{ margin: 0 }}>
                {updateDownloaded
                  ? t('updater.updateReady', '更新已就绪')
                  : t('updater.newVersionAvailable', '发现新版本')}
              </h3>
              <div style={{ color: token.colorTextSecondary, fontSize: 12 }}>
                {updateInfo?.version}
              </div>
            </div>

            {updateInfo?.releaseNotes && <Markdown>{updateInfo.releaseNotes as string}</Markdown>}

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <Button
                onClick={() => {
                  autoUpdateService.downloadUpdate();
                }}
                size="small"
                type="primary"
              >
                {t('updater.downloadNow', '立即更新')}
              </Button>
            </div>
          </div>
        }
        onOpenChange={setIsPopoverVisible}
        open={isPopoverVisible}
        placement="bottomRight"
        title={null}
        trigger="hover"
      >
        <Flexbox
          align={'center'}
          className={styles.container}
          gap={4}
          horizontal
          onClick={() => setIsPopoverVisible(true)}
        >
          <Icon icon={Download} style={{ fontSize: 14 }} /> 已有可用更新
        </Flexbox>
      </Popover>

      {/* 下次启动时更新提示 */}
      {willInstallLater && (
        <div
          style={{
            backgroundColor: token.colorBgElevated,
            borderRadius: token.borderRadius,
            bottom: 20,
            boxShadow: token.boxShadow,
            color: token.colorText,
            padding: '10px 16px',
            position: 'fixed',
            right: 20,
            zIndex: 1000,
          }}
        >
          {t('updater.willInstallLater', '更新将在下次启动时安装')}
        </div>
      )}
    </Flexbox>
  );
};
