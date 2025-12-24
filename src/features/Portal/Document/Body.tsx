'use client';

import { Flexbox } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { memo } from 'react';

import { useChatStore } from '@/store/chat';
import { chatPortalSelectors } from '@/store/chat/selectors';

import AutoSaveHint from './AutoSaveHint';
import { DocumentEditorProvider } from './DocumentEditorProvider';
import EditorCanvas from './EditorCanvas';
import Title from './Title';

const useStyles = createStyles(({ css }) => ({
  content: css`
    overflow: auto;
    flex: 1;
    padding-inline: 12px;
  `,
  header: css`
    position: absolute;
    z-index: 1;
    inset-block-start: 8px;
    inset-inline-end: 12px;
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
      <Flexbox flex={1} height={'100%'} style={{ overflow: 'hidden', position: 'relative' }}>
        <div className={styles.header}>
          <AutoSaveHint />
        </div>
        <div className={styles.content}>
          <Title />
          <EditorCanvas />
        </div>
      </Flexbox>
    </DocumentEditorProvider>
  );
});

export default DocumentBody;
