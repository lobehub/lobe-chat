import { ScrollShadow } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { fileChatSelectors, useFileStore } from '@/store/file';

import FileItem from './FileItem';

const useStyles = createStyles(({ css }) => ({
  container: css`
    overflow-x: scroll;
    width: 100%;
  `,
}));

const FileList = memo(() => {
  const inputFilesList = useFileStore(fileChatSelectors.chatUploadFileList);
  const showFileList = useFileStore(fileChatSelectors.chatUploadFileListHasItem);
  const { styles } = useStyles();

  if (!inputFilesList.length || !showFileList) return null;

  return (
    <ScrollShadow
      className={styles.container}
      hideScrollBar
      horizontal
      orientation={'horizontal'}
      size={8}
    >
      <Flexbox gap={4} horizontal paddingBlock={4} paddingInline={0} wrap={'wrap'}>
        {inputFilesList.map((item) => (
          <FileItem key={item.id} {...item} />
        ))}
      </Flexbox>
    </ScrollShadow>
  );
});

export default FileList;
