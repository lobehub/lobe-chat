import { ActionIcon, Image, ImageProps } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { Trash } from 'lucide-react';
import { CSSProperties, memo } from 'react';

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

interface ImageItemProps {
  alt?: string;
  alwaysShowClose?: boolean;
  className?: string;
  editable?: boolean;
  loading?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
  preview?: ImageProps['preview'];
  style?: CSSProperties;
  url?: string;
}

const ImageItem = memo<ImageItemProps>(
  ({ className, style, editable, alt, onRemove, url, loading, alwaysShowClose, preview }) => {
    const IMAGE_SIZE = editable ? MIN_IMAGE_SIZE : '100%';
    const { styles, cx } = useStyles();
    const { isSafari } = usePlatform();

    return (
      <Image
        actions={
          editable && (
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
          )
        }
        alt={alt || ''}
        alwaysShowActions={alwaysShowClose}
        className={className}
        height={isSafari ? 'auto' : '100%'}
        isLoading={loading}
        preview={preview}
        size={IMAGE_SIZE as any}
        src={url}
        style={{ height: isSafari ? 'auto' : '100%', width: '100%', ...style }}
        wrapperClassName={cx(styles.image, editable && styles.editableImage)}
      />
    );
  },
);

export default ImageItem;
