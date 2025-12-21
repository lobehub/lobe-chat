import { Flexbox, ScrollShadow } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { memo, useEffect, useRef } from 'react';

import { fileChatSelectors, useFileStore } from '@/store/file';

import { useAgentId } from '../../hooks/useAgentId';
import ContextItem from './ContextItem';
import SelectionItem from './SelectionItem';

const useStyles = createStyles(({ css }) => ({
  container: css`
    overflow-x: scroll;
    width: 100%;
  `,
}));

const ContextList = memo(() => {
  const agentId = useAgentId();
  const prevAgentIdRef = useRef<string | undefined>(undefined);
  const inputFilesList = useFileStore(fileChatSelectors.chatUploadFileList);
  const showFileList = useFileStore(fileChatSelectors.chatUploadFileListHasItem);
  const rawSelectionList = useFileStore(fileChatSelectors.chatContextSelections);
  const showSelectionList = useFileStore(fileChatSelectors.chatContextSelectionHasItem);
  const clearChatContextSelections = useFileStore((s) => s.clearChatContextSelections);
  const { styles } = useStyles();

  // Clear selections only when agentId changes (not on initial mount)
  useEffect(() => {
    if (prevAgentIdRef.current !== undefined && prevAgentIdRef.current !== agentId) {
      clearChatContextSelections();
    }
    prevAgentIdRef.current = agentId;
  }, [agentId, clearChatContextSelections]);

  // Filter duplicates based on preview content
  const selectionList = rawSelectionList.filter(
    (item, index, self) => index === self.findIndex((t) => t.preview === item.preview),
  );

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
