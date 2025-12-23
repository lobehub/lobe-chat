'use client';

import { BUILTIN_AGENT_SLUGS } from '@lobechat/builtin-agents';
import { Flexbox } from '@lobehub/ui';
import { useTheme } from 'antd-style';
import { type FC, memo } from 'react';

import Loading from '@/components/Loading/BrandTextLoading';
import WideScreenContainer from '@/features/WideScreenContainer';
import { useRegisterFilesHotkeys, useSaveDocumentHotkey } from '@/hooks/useHotkeys';
import { useAgentStore } from '@/store/agent';
import { builtinAgentSelectors } from '@/store/agent/selectors';
import { useFileStore } from '@/store/file';

import Body from './Body';
import Copilot from './Copilot';
import Header from './Header';
import PageAgentProvider from './PageAgentProvider';
import { PageEditorProvider } from './PageEditorProvider';
import PageTitle from './PageTitle';
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

  const theme = useTheme();

  // Register Files scope and save document hotkey
  useRegisterFilesHotkeys();
  useSaveDocumentHotkey(flushSave);

  return (
    <>
      <PageTitle />
      <Flexbox
        height={'100%'}
        horizontal
        style={{ backgroundColor: theme.colorBgContainer }}
        width={'100%'}
      >
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
    </>
  );
});

/**
 * Edit a page
 *
 * A reusable component. Should NOT depend on context.
 */
const PageEditor: FC<PageEditorProps> = ({
  pageId,
  knowledgeBaseId,
  onDocumentIdChange,
  onSave,
  onBack,
}) => {
  const useInitBuiltinAgent = useAgentStore((s) => s.useInitBuiltinAgent);
  const pageAgentId = useAgentStore(builtinAgentSelectors.pageAgentId);

  useInitBuiltinAgent(BUILTIN_AGENT_SLUGS.pageAgent);

  const [deletePage] = useFileStore((s) => [s.deletePage]);

  if (!pageAgentId) return <Loading debugId="PageEditor > PageAgent Init" />;

  return (
    <PageAgentProvider pageAgentId={pageAgentId}>
      <PageEditorProvider
        key={pageId}
        knowledgeBaseId={knowledgeBaseId}
        onBack={onBack}
        onDelete={() => deletePage(pageId || '')}
        onDocumentIdChange={onDocumentIdChange}
        onSave={onSave}
        pageId={pageId}
      >
        <PageEditorCanvas />
      </PageEditorProvider>
    </PageAgentProvider>
  );
};

export default PageEditor;
