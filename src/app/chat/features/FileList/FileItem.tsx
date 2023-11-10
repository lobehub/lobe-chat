import { Image } from 'antd';
import { createStyles } from 'antd-style';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useFileStore } from '@/store/files';

const useStyles = createStyles(({ css }) => {
  return {
    container: css`
      width: 80px;
      height: 80px;
      border-radius: 8px;
    `,
    image: css`
      border-radius: 8px;
    `,
  };
});

const FileItem = memo<{ id: string }>(({ id }) => {
  const { styles } = useStyles();
  const useFetchFile = useFileStore((s) => s.useFetchFile);

  const { data, isLoading } = useFetchFile(id);
  console.log(data);

  return (
    <Flexbox className={styles.container}>
      {isLoading
        ? 'loading...'
        : data && (
            <Image
              alt={data?.name || ''}
              className={styles.image}
              fetchPriority={'high'}
              height={80}
              src={data?.url}
              width={80}
            />
          )}
    </Flexbox>
  );
});

export default FileItem;
