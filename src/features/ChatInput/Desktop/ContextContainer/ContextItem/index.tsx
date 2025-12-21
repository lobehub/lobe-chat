import { Flexbox, Tag, Tooltip } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { memo } from 'react';

import { useFileStore } from '@/store/file';
import { UploadFileItem } from '@/types/files/upload';

import Content from './Content';
import { getFileBasename } from './utils';

const useStyles = createStyles(({ css, token }) => ({
  closeBtn: css`
    flex-shrink: 0;
    color: ${token.colorTextTertiary};

    &:hover {
      color: ${token.colorError};
      background: ${token.colorErrorBg};
    }
  `,
  icon: css`
    flex-shrink: 0;
    width: 18px;
    height: 18px;
    border-radius: 4px;

    img,
    video {
      width: 100%;
      height: 100%;
      border-radius: 4px;
      object-fit: cover;
    }
  `,
  name: css`
    overflow: hidden;
    flex: 1;

    min-width: 0;

    text-overflow: ellipsis;
    white-space: nowrap;
  `,
}));

type FileItemProps = UploadFileItem;

const ContextItem = memo<FileItemProps>((props) => {
  const { file, id } = props;
  const { styles } = useStyles();
  const [removeChatUploadFile] = useFileStore((s) => [s.removeChatUploadFile]);

  const basename = getFileBasename(file.name);

  return (
    <Tag closable onClose={() => removeChatUploadFile(id)} size={'large'}>
      <Flexbox className={styles.icon}>
        <Content {...props} />
      </Flexbox>
      <Tooltip title={file.name}>
        <span className={styles.name}>{basename}</span>
      </Tooltip>
    </Tag>
  );
});

export default ContextItem;
