'use client';

import { BUILTIN_AGENT_SLUGS } from '@lobechat/builtin-agents';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import Loading from '@/components/Loading/BrandTextLoading';
import WideScreenContainer from '@/features/Conversation/components/WideScreenContainer';
import { useRegisterFilesHotkeys, useSaveDocumentHotkey } from '@/hooks/useHotkeys';
import { useAgentStore } from '@/store/agent';
import { builtinAgentSelectors } from '@/store/agent/selectors';

import Body from './Body';
import Copilot from './Copilot';
import Header from './Header';
import PageAgentProvider from './PageAgentProvider';
import { PageEditorProvider } from './PageEditorProvider';
import { usePageEditorStore } from './store';

interface PageEditorProps {
  knowledgeBaseId?: string;
  onBack?: () => void;
  onDelete?: () => void;
  onDocumentIdChange?: (newId: string) => void;
  onSave?: () => void;
  pageId?: string;
}

const PageEditorCanvas = memo(() => {
  const editor = usePageEditorStore((s) => s.editor);
  const flushSave = usePageEditorStore((s) => s.flushSave);

  // Register Files scope and save document hotkey
  useRegisterFilesHotkeys();
  useSaveDocumentHotkey(flushSave);

  return (
    <Flexbox height={'100%'} horizontal width={'100%'}>
      <Flexbox flex={1} height={'100%'}>
        <Header />
        <Flexbox
          height={'100%'}
          horizontal
          style={{ display: 'flex', overflowY: 'auto', position: 'relative' }}
          width={'100%'}
        >
          <WideScreenContainer onClick={() => editor?.focus()} wrapperStyle={{ cursor: 'text' }}>
            <Body />
          </WideScreenContainer>
        </Flexbox>
      </Flexbox>
      <Copilot />
    </Flexbox>
  );
});

/**
 * Edit a page
 */
const PageEditor = memo<PageEditorProps>(
  ({ pageId, knowledgeBaseId, onDocumentIdChange, onSave, onDelete, onBack }) => {
    const useInitBuiltinAgent = useAgentStore((s) => s.useInitBuiltinAgent);
    const pageAgentId = useAgentStore(builtinAgentSelectors.pageAgentId);
    useInitBuiltinAgent(BUILTIN_AGENT_SLUGS.pageAgent);

    // Don't render conversation provider until agent is initialized
    if (!pageAgentId) return <Loading />;

    return (
      <PageAgentProvider pageAgentId={pageAgentId}>
        <PageEditorProvider
          knowledgeBaseId={knowledgeBaseId}
          onBack={onBack}
          onDelete={onDelete}
          onDocumentIdChange={onDocumentIdChange}
          onSave={onSave}
          pageId={pageId}
        >
          <PageEditorCanvas />
        </PageEditorProvider>
      </PageAgentProvider>
    );
  },
);

export default PageEditor;
