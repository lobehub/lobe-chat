'use client';

import dynamic from 'next/dynamic';
import { memo, useMemo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useResourceManagerStore } from '@/app/[variants]/(main)/resource/features/store';
import PageEditor from '@/features/PageEditor';

import PageExplorer from '../PageExplorer';
import FileEditor from './FileEditor';
import FileExplorer from './FileExplorer';
import UploadDock from './UploadDock';

const ChunkDrawer = dynamic(() => import('./ChunkDrawer'), { ssr: false });

export type ResouceManagerMode = 'page' | 'pages' | 'files' | 'file';

interface KnowledgeManagerProps {
  category?: string;
  documentId?: string;
  knowledgeBaseId?: string;
  onOpenFile?: (id: string) => void;
  title: string;
}

/**
 * Manage knowledge items. Can be all items or certian repo.
 *
 * PageExplorer: For the "pages" category.
 * FileExplorer: For other categories.
 */
const ResourceManager = memo<KnowledgeManagerProps>(
  ({ knowledgeBaseId, category, onOpenFile, documentId }) => {
    const [mode, currentViewItemId, setMode] = useResourceManagerStore((s) => [
      s.mode,
      s.currentViewItemId,
      s.setMode,
    ]);

    const MainContent = useMemo(() => {
      switch (mode) {
        case 'page': {
          return <PageEditor knowledgeBaseId={knowledgeBaseId} pageId={currentViewItemId} />;
        }
        case 'pages': {
          return <PageExplorer knowledgeBaseId={knowledgeBaseId} pageId={currentViewItemId} />;
        }
        case 'file': {
          return (
            <FileEditor
              category={category}
              currentViewItemId={currentViewItemId ?? ''}
              knowledgeBaseId={knowledgeBaseId}
              onBack={() => {
                setMode('files');
              }}
            />
          );
        }
        case 'files': {
          return (
            <FileExplorer
              category={category}
              knowledgeBaseId={knowledgeBaseId}
              onOpenFile={onOpenFile}
            />
          );
        }
      }
    }, [mode, currentViewItemId, documentId, knowledgeBaseId, category, onOpenFile, setMode]);

    return (
      <>
        <Flexbox gap={12} height={'100%'}>
          {MainContent}
        </Flexbox>
        <UploadDock />
        <ChunkDrawer />
      </>
    );
  },
);

export default ResourceManager;
