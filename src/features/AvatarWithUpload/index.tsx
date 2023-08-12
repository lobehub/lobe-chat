import { Avatar, Logo } from '@lobehub/ui';
import { Upload } from 'antd';
import { createStyles } from 'antd-style';
import { memo } from 'react';
import { useSettings } from 'src/store/global';

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
  size?: number;
}

const AvatarWithUpload = memo<AvatarWithUploadProps>(({ size = 40 }) => {
  const [avatar, setSettings] = useSettings((st) => [st.settings.avatar, st.setSettings]);
  const { styles } = useStyle();

  const handleUploadAvatar = createUploadImageHandler((avatar) => {
    setSettings({ avatar });
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
