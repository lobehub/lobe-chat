import { Image } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { memo } from 'react';

import FileIcon from '@/components/FileIcon';
import { UploadFileItem } from '@/types/files/upload';

const useStyles = createStyles(({ css }) => ({
  image: css`
    width: 100%;
    height: 100%;
    margin-block: 0 !important;
    box-shadow: none;

    img {
      width: 100%;
      height: 100%;
      border-radius: 4px;
      object-fit: cover;
    }
  `,
  video: css`
    overflow: hidden;
    width: 100%;
    height: 100%;
    border-radius: 4px;
  `,
}));

const Content = memo<UploadFileItem>(({ file, previewUrl }) => {
  const { styles } = useStyles();

  if (file.type.startsWith('image')) {
    return <Image alt={file.name} src={previewUrl} wrapperClassName={styles.image} />;
  }

  if (file.type.startsWith('video')) {
    return <video className={styles.video} src={previewUrl} />;
  }

  return <FileIcon fileName={file.name} fileType={file.type} size={16} />;
});

export default Content;
