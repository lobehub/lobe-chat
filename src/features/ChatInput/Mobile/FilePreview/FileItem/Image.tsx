import { ActionIcon, Image } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { Trash } from 'lucide-react';
import { memo } from 'react';

import { MIN_IMAGE_SIZE } from './style';

const useStyles = createStyles(({ css, token }) => ({
  deleteButton: css`
    color: #fff;
    background: ${token.colorBgMask};

    &:hover {
      background: ${token.colorError};
    }
  `,
  editableImage: css`
    background: ${token.colorBgContainer};
    box-shadow: 0 0 0 1px ${token.colorFill} inset;
  `,
  image: css`
    width: 64px !important;
    height: 64px !important;
    margin-block: 0 !important;
  `,
}));

interface FileItemProps {
  alt?: string;
  loading?: boolean;
  onRemove?: () => void;
  src?: string;
}

const FileItem = memo<FileItemProps>(({ alt, onRemove, src, loading }) => {
  const IMAGE_SIZE = MIN_IMAGE_SIZE;
  const { styles, cx } = useStyles();

  return (
    <Image
      actions={
        <ActionIcon
          className={styles.deleteButton}
          glass
          icon={Trash}
          onClick={(e) => {
            e.stopPropagation();
            onRemove?.();
          }}
          size={'small'}
        />
      }
      alt={alt || ''}
      alwaysShowActions
      height={64}
      isLoading={loading}
      objectFit={'cover'}
      size={IMAGE_SIZE as any}
      src={src}
      width={64}
      wrapperClassName={cx(styles.image, styles.editableImage)}
    />
  );
});

export default FileItem;
