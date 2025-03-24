'use client';

import { Upload, message } from 'antd';
import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { useUserStore } from '@/store/user';
import { imageToBase64 } from '@/utils/imageToBase64';
import { createUploadImageHandler } from '@/utils/uploadFIle';

import UserAvatar, { type UserAvatarProps } from '../User/UserAvatar';

interface AvatarWithUploadProps extends UserAvatarProps {
  compressSize?: number;
}

const AvatarWithUpload = memo<AvatarWithUploadProps>(
  ({ size = 40, compressSize = 256, ...rest }) => {
    const { t } = useTranslation('file');
    const updateAvatar = useUserStore((state) => state.updateAvatar);

    const handleUploadAvatar = useCallback(
      createUploadImageHandler((avatar) => {
        // 显示上传加载中提示
        const loadingMessage = message.loading({
          content: t('uploadDock.uploadStatus.uploading'),
          duration: 0,
        });

        const img = new Image();
        img.src = avatar;
        img.addEventListener('load', async () => {
          try {
            const webpBase64 = imageToBase64({ img, size: compressSize });
            await updateAvatar(webpBase64);

            // 关闭加载提示
            loadingMessage();

            // 显示上传成功提示
            message.success({
              content: t('uploadDock.uploadStatus.success'),
            });
          } catch (error) {
            // 关闭加载提示
            loadingMessage();

            // 显示上传失败提示
            message.error({
              content: t('uploadDock.uploadStatus.error'),
            });

            console.error('Failed to upload avatar:', error);
          }
        });
      }),
      [t],
    );

    return (
      <Upload beforeUpload={handleUploadAvatar} itemRender={() => void 0} maxCount={1}>
        <UserAvatar clickable size={size} {...rest} />
      </Upload>
    );
  },
);

export default AvatarWithUpload;
