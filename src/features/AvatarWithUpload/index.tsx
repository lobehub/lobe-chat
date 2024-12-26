'use client';

import { Upload } from 'antd';
import { memo } from 'react';

import { useUserStore } from '@/store/user';
import { compressImage } from '@/utils/imageToBase64';

import UserAvatar, { type UserAvatarProps } from '../User/UserAvatar';

interface AvatarWithUploadProps extends UserAvatarProps {
  compressSize?: number;
}

const AvatarWithUpload = memo<AvatarWithUploadProps>(
  ({ size = 40, compressSize = 256, ...rest }) => {
    const updateAvatar = useUserStore((s) => s.updateAvatar);

    return (
      <Upload
        accept={'image/*'}
        beforeUpload={async (file) => {
          const image = await compressImage({ file, size: compressSize });

          updateAvatar(image);
        }}
        itemRender={() => void 0}
        maxCount={1}
      >
        <UserAvatar clickable size={size} {...rest} />
      </Upload>
    );
  },
);

export default AvatarWithUpload;
