import { ScrollShadow } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { fileChatSelectors, useFileStore } from '@/store/file';

import ContextItem from './ContextItem';
import SelectionItem from './SelectionItem';

const useStyles = createStyles(({ css }) => ({
  container: css`
    overflow-x: scroll;
    width: 100%;
  `,
}));

const ContextList = memo(() => {
  const inputFilesList = useFileStore(fileChatSelectors.chatUploadFileList);
  const showFileList = useFileStore(fileChatSelectors.chatUploadFileListHasItem);
  const selectionList = useFileStore(fileChatSelectors.chatContextSelections);
  const showSelectionList = useFileStore(fileChatSelectors.chatContextSelectionHasItem);
  const { styles } = useStyles();

  if ((!inputFilesList.length || !showFileList) && !showSelectionList) return null;

  return (
    <ScrollShadow
      className={styles.container}
      hideScrollBar
      horizontal
      orientation={'horizontal'}
      size={8}
    >
      <Flexbox gap={4} horizontal paddingInline={0} style={{ paddingBlockStart: 8 }} wrap={'wrap'}>
        {selectionList.map((item) => (
          <SelectionItem key={item.id} {...item} />
        ))}
        {inputFilesList.map((item) => (
          <ContextItem key={item.id} {...item} />
        ))}
      </Flexbox>
    </ScrollShadow>
  );
});

export default ContextList;
