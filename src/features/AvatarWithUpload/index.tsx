import { Avatar, Logo } from '@lobehub/ui';
import { Upload } from 'antd';
import { createStyles } from 'antd-style';
import { memo } from 'react';

import { useGlobalStore } from '@/store/global';
import { createUploadImageHandler } from '@/utils/uploadFIle';

const useStyle = createStyles(
  ({ css, token }) => css`
    cursor: pointer;
    border-radius: 50%;
    transition: scale 400ms ${token.motionEaseOut}, box-shadow 100ms ${token.motionEaseOut};

    &:hover {
      box-shadow: 0 0 0 3px ${token.colorText};
    }

    &:active {
      scale: 0.8;
    }
  `,
);

interface AvatarWithUploadProps {
  compressSize?: number;
  size?: number;
}

const AvatarWithUpload = memo<AvatarWithUploadProps>(({ size = 40, compressSize = 128 }) => {
  const [avatar, setSettings] = useGlobalStore((st) => [st.settings.avatar, st.setSettings]);
  const { styles } = useStyle();

  const handleUploadAvatar = createUploadImageHandler((avatar) => {
    const img = new Image();
    img.src = avatar;
    img.addEventListener('load', () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
      let startX = 0;
      let startY = 0;

      if (img.width > img.height) {
        startX = (img.width - img.height) / 2;
      } else {
        startY = (img.height - img.width) / 2;
      }

      canvas.width = compressSize;
      canvas.height = compressSize;

      ctx.drawImage(
        img,
        startX,
        startY,
        Math.min(img.width, img.height),
        Math.min(img.width, img.height),
        0,
        0,
        compressSize,
        compressSize,
      );

      const webpBase64 = canvas.toDataURL('image/webp');
      setSettings({ avatar: webpBase64 });
    });
  });

  return (
    <div className={styles} style={{ maxHeight: size, maxWidth: size }}>
      <Upload beforeUpload={handleUploadAvatar} itemRender={() => void 0} maxCount={1}>
        {avatar ? <Avatar avatar={avatar} size={size} /> : <Logo size={size} />}
      </Upload>
    </div>
  );
});

export default AvatarWithUpload;
