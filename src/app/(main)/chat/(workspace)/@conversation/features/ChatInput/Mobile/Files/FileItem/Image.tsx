import { ActionIcon, Image } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { Trash } from 'lucide-react';
import { memo } from 'react';

import { usePlatform } from '@/hooks/usePlatform';

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
    margin-block: 0 !important;

    .ant-image {
      height: 100% !important;

      img {
        height: 100% !important;
      }
    }
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
  const { isSafari } = usePlatform();

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
      height={isSafari ? 'auto' : '100%'}
      isLoading={loading}
      size={IMAGE_SIZE as any}
      src={src}
      style={{ height: isSafari ? 'auto' : '100%' }}
      wrapperClassName={cx(styles.image, styles.editableImage)}
    />
  );
});

export default FileItem;
