'use client';

import { Flexbox, Markdown, Text } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { memo } from 'react';

import { useChatStore } from '@/store/chat';
import { chatPortalSelectors } from '@/store/chat/selectors';
import { useNotebookStore } from '@/store/notebook';
import { notebookSelectors } from '@/store/notebook/selectors';

const useStyles = createStyles(({ token, css }) => ({
  content: css`
    overflow: auto;
    flex: 1;
    padding-inline: 12px;
  `,
  description: css`
    padding: 12px;
    border-block-end: 1px solid ${token.colorBorderSecondary};
    font-size: 13px;
    color: ${token.colorTextSecondary};
  `,
}));

const DocumentBody = memo(() => {
  const { styles } = useStyles();

  const [topicId, documentId] = useChatStore((s) => [
    s.activeTopicId,
    chatPortalSelectors.portalDocumentId(s),
  ]);

  const document = useNotebookStore(notebookSelectors.getDocumentById(topicId, documentId));

  if (!document) return null;

  return (
    <Flexbox flex={1} height={'100%'} style={{ overflow: 'hidden' }}>
      {document.description && <Text className={styles.description}>{document.description}</Text>}
      <div className={styles.content}>
        <Markdown>{document.content || ''}</Markdown>
      </div>
    </Flexbox>
  );
});

export default DocumentBody;
