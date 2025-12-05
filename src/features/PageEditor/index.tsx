'use client';

import { BUILTIN_AGENT_SLUGS } from '@lobechat/builtin-agents';
import { App } from 'antd';
import { useTheme } from 'antd-style';
import { memo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { BrandTextLoading } from '@/components/Loading';
import WideScreenContainer from '@/features/Conversation/components/WideScreenContainer';
import { useAgentStore } from '@/store/agent';
import { builtinAgentSelectors } from '@/store/agent/selectors';

import Body from './Body';
import { PageEditorProvider, usePageEditorContext } from './Context';
import Copilot from './Copilot';
import Header from './Header';
import PageAgentProvider from './PageAgentProvider';

interface PageEditorProps {
  knowledgeBaseId?: string;
  onBack?: () => void;
  onDelete?: () => void;
  onDocumentIdChange?: (newId: string) => void;
  onSave?: () => void;
  pageId?: string;
}

const PageEditorContent = memo(() => {
  const { t } = useTranslation('file');
  const { message } = App.useApp();
  const { performSave, editor } = usePageEditorContext();

  // Handle Cmd+S / Ctrl+S keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        void performSave();
        message.info(t('documentEditor.autoSaveMessage'));
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [t, message, performSave]);

  return (
    <Flexbox height={'100%'} horizontal>
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
    const theme = useTheme();

    const useInitBuiltinAgent = useAgentStore((s) => s.useInitBuiltinAgent);
    const pageAgentId = useAgentStore(builtinAgentSelectors.pageAgentId);
    useInitBuiltinAgent(BUILTIN_AGENT_SLUGS.pageAgent);

    // Don't render conversation provider until agent is initialized
    if (!pageAgentId) {
      return (
        <Flexbox height={'100%'} horizontal style={{ background: theme.colorBgContainer }}>
          <Flexbox flex={1} height={'100%'} style={{ background: theme.colorBgContainer }}>
            <BrandTextLoading />
          </Flexbox>
        </Flexbox>
      );
    }

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
          <PageEditorContent />
        </PageEditorProvider>
      </PageAgentProvider>
    );
  },
);

export default PageEditor;
