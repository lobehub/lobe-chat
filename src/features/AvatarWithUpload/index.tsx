'use client';

import { Upload } from 'antd';
import { memo, useCallback } from 'react';

import { useUserStore } from '@/store/user';
import { imageToBase64 } from '@/utils/imageToBase64';
import { createUploadImageHandler } from '@/utils/uploadFIle';

import UserAvatar, { type UserAvatarProps } from '../User/UserAvatar';

interface AvatarWithUploadProps extends UserAvatarProps {
  compressSize?: number;
}

const AvatarWithUpload = memo<AvatarWithUploadProps>(
  ({ size = 40, compressSize = 256, ...rest }) => {
    const updateAvatar = useUserStore((s) => s.updateAvatar);

    const handleUploadAvatar = useCallback(
      createUploadImageHandler((avatar) => {
        const img = new Image();
        img.src = avatar;
        img.addEventListener('load', () => {
          const webpBase64 = imageToBase64({ img, size: compressSize });
          updateAvatar(webpBase64);
        });
      }),
      [],
    );

    return (
      <Upload beforeUpload={handleUploadAvatar} itemRender={() => void 0} maxCount={1}>
        <UserAvatar clickable size={size} {...rest} />
      </Upload>
    );
  },
);

export default AvatarWithUpload;
