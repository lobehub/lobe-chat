'use client';

import { DraggablePanel } from '@lobehub/ui';
import { memo } from 'react';

import DocumentConversation from './DocumentConversation';
import { usePageEditorContext } from './PageEditorContext';

const PageEditorCopilot = memo(() => {
  const { chatPanelExpanded, setChatPanelExpanded } = usePageEditorContext();

  return (
    <DraggablePanel
      expand={chatPanelExpanded}
      maxWidth={600}
      minWidth={300}
      onExpandChange={setChatPanelExpanded}
      placement="right"
    >
      <DocumentConversation />
    </DraggablePanel>
  );
});

export default PageEditorCopilot;
