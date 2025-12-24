'use client';

import { Flexbox } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { memo } from 'react';

import { useChatStore } from '@/store/chat';
import { chatPortalSelectors } from '@/store/chat/selectors';

import { DocumentEditorProvider } from './DocumentEditorProvider';
import EditorCanvas from './EditorCanvas';

const useStyles = createStyles(({ css }) => ({
  content: css`
    overflow: auto;
    flex: 1;
    padding-inline: 12px;
  `,
}));

const DocumentBody = memo(() => {
  const { styles } = useStyles();

  const [topicId, documentId] = useChatStore((s) => [
    s.activeTopicId,
    chatPortalSelectors.portalDocumentId(s),
  ]);

  if (!documentId) return null;

  return (
    <DocumentEditorProvider documentId={documentId} topicId={topicId}>
      <Flexbox flex={1} height={'100%'} style={{ overflow: 'hidden' }}>
        <div className={styles.content}>
          <EditorCanvas />
        </div>
      </Flexbox>
    </DocumentEditorProvider>
  );
});

export default DocumentBody;
