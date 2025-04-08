import { useWatchBroadcast } from '@lobechat/electron-client-ipc';
import { Button, Modal, Progress } from 'antd';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { autoUpdateService } from '@/services/electron/autoUpdate';

interface UpdateInfo {
  releaseDate: string;
  version: string;
}

export const UpdateNotification: React.FC = () => {
  const { t } = useTranslation('electron');
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [updateDownloaded, setUpdateDownloaded] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  useWatchBroadcast('updateError', (message: string) => {
    setError(message);
  });

  const handleDownload = () => {
    setUpdateAvailable(false);
    autoUpdateService.downloadUpdate();
  };

  const handleCancel = () => {
    setUpdateAvailable(false);
  };

  const handleCancelDownloaded = () => {
    setUpdateDownloaded(false);
  };

  console.log(error);
  return (
    <>
      {/* 有更新可用通知 */}
      <Modal
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            {t('updater.later', '稍后更新')}
          </Button>,
          <Button key="download" onClick={handleDownload} type="primary">
            {t('updater.downloadNow', '立即下载')}
          </Button>,
        ]}
        onCancel={handleCancel}
        open={updateAvailable}
        title={t('updater.newVersionAvailable', '新版本可用')}
      >
        <p>{t('updater.newVersionAvailableDesc', { version: updateInfo?.version })}</p>
      </Modal>

      {/* 更新下载进度 */}
      {downloadProgress > 0 && downloadProgress < 100 && (
        <Modal closable={false} footer={null} open={true} title={t('updater.downloadingUpdate')}>
          <Progress percent={Math.round(downloadProgress)} status="active" />
          <p>{t('updater.downloadingUpdateDesc')}</p>
        </Modal>
      )}

      {/* 更新已下载通知 */}
      <Modal
        footer={[
          <Button key="cancel" onClick={handleCancelDownloaded}>
            {t('updater.later', '稍后安装')}
          </Button>,
          <Button
            key="install"
            onClick={() => {
              autoUpdateService.quitAndInstallUpdate();
            }}
            type="primary"
          >
            {t('updater.restartAndInstall', '重启并安装')}
          </Button>,
        ]}
        onCancel={handleCancelDownloaded}
        open={updateDownloaded}
        title={t('updater.updateReady', '更新已就绪')}
      >
        <p>{t('updater.updateReadyDesc', { version: updateInfo?.version })}</p>
      </Modal>
      <div>更新</div>
      {/* 更新错误通知 */}
      {/*{error && (*/}
      {/*  <Alert*/}
      {/*    closable*/}
      {/*    description={error}*/}
      {/*    message={t('updater.updateError', '更新错误')}*/}
      {/*    onClose={() => setError(null)}*/}
      {/*    showIcon*/}
      {/*    style={{ bottom: 20, position: 'fixed', right: 20, width: 300 }}*/}
      {/*    type="error"*/}
      {/*  />*/}
      {/*)}*/}
    </>
  );
};
