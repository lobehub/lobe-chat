import { Avatar, Logo } from '@lobehub/ui';
import { Upload } from 'antd';
import { memo } from 'react';
import { shallow } from 'zustand/shallow';

import { useSettings } from '@/store/settings';
import { createUploadImageHandler } from '@/utils/uploadFIle';

interface AvatarWithUploadProps {
  size?: number;
}

export default memo<AvatarWithUploadProps>(({ size = 40 }) => {
  const [avatar, setSettings] = useSettings((st) => [st.settings.avatar, st.setSettings], shallow);

  const handleUploadAvatar = createUploadImageHandler((avatar) => {
    setSettings({ avatar });
  });

  return (
    <div style={{ maxHeight: size, maxWidth: size }}>
      <Upload beforeUpload={handleUploadAvatar} itemRender={() => void 0} maxCount={1}>
        {avatar ? <Avatar avatar={avatar} size={size} /> : <Logo size={size} />}
      </Upload>
    </div>
  );
});
