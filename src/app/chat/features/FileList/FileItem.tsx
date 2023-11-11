import { CloseCircleFilled } from '@ant-design/icons';
import { Skeleton } from 'antd';
import { createStyles } from 'antd-style';
import Image from 'next/image';
import { memo } from 'react';
import { Center, Flexbox } from 'react-layout-kit';

import { useFileStore } from '@/store/files';

const IMAGE_SIZE = 64;

const useStyles = createStyles(({ css, cx, token, isDarkMode }) => {
  const closeIcon = cx(css`
    cursor: pointer;

    position: absolute;
    top: -6px;
    right: -6px;

    width: 16px;
    height: 16px;

    color: ${isDarkMode ? token.colorTextQuaternary : token.colorTextTertiary};

    opacity: 0;
    background: ${isDarkMode ? token.colorTextSecondary : token.colorBgContainer};
    border-radius: 50%;

    transition: all 0.2s ease-in;

    &:hover {
      scale: 1.2;
    }
  `);

  return {
    closeIcon,
    container: css`
      cursor: pointer;

      position: relative;

      width: ${IMAGE_SIZE}px;
      height: ${IMAGE_SIZE}px;

      border-radius: 8px;

      &:hover {
        .${closeIcon} {
          opacity: 1;
        }
      }
    `,
    image: css`
      opacity: ${isDarkMode ? 0.6 : 1};
      object-fit: cover;
      border-radius: 8px;
      animation: fade-in 0.3s ease-in;

      @keyframes fade-in {
        from {
          scale: 1.2;
          opacity: 0;
        }

        to {
          scale: 1;
          opacity: 1;
        }
      }
    `,
    imageCtn: css`
      position: relative;
    `,
    imageWrapper: css`
      overflow: hidden;
      width: ${IMAGE_SIZE}px;
      height: ${IMAGE_SIZE}px;
    `,
    loading: css`
      border-radius: 8px;
    `,
  };
});

const FileItem = memo<{ id: string; onClick: () => void }>(({ id, onClick }) => {
  const { styles } = useStyles();
  const [useFetchFile, removeFile] = useFileStore((s) => [s.useFetchFile, s.removeFile]);

  const { data, isLoading } = useFetchFile(id);

  return (
    <Flexbox className={styles.container} onClick={onClick}>
      {isLoading ? (
        <Skeleton
          active
          title={{
            className: styles.loading,
            style: { borderRadius: 8, height: IMAGE_SIZE },
            width: IMAGE_SIZE,
          }}
        />
      ) : (
        data && (
          <Flexbox className={styles.imageCtn}>
            <div className={styles.imageWrapper}>
              <Image
                alt={data.name || ''}
                className={styles.image}
                fetchPriority={'high'}
                height={IMAGE_SIZE}
                loading={'lazy'}
                src={data.url}
                width={IMAGE_SIZE}
              />
            </div>
          </Flexbox>
        )
      )}
      <Center
        className={styles.closeIcon}
        onClick={(e) => {
          e.stopPropagation();

          removeFile(id);
        }}
      >
        <CloseCircleFilled />
      </Center>
    </Flexbox>
  );
});

export default FileItem;
