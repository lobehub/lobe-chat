'use client';

import dynamic from 'next/dynamic';
import { memo, useMemo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useResourceManagerStore } from '@/app/[variants]/(main)/resource/features/store';
import PageEditor from '@/features/PageEditor';

import PageExplorer from '../../app/[variants]/(main)/page/features';
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
    const [mode, currentViewItemId] = useResourceManagerStore((s) => [s.mode, s.currentViewItemId]);

    const MainContent = useMemo(() => {
      switch (mode) {
        case 'page': {
          return <PageEditor knowledgeBaseId={knowledgeBaseId} pageId={currentViewItemId} />;
        }
        case 'pages': {
          return <PageExplorer knowledgeBaseId={knowledgeBaseId} pageId={currentViewItemId} />;
        }
        case 'files':
        case 'file': {
          return (
            <FileExplorer
              category={category}
              knowledgeBaseId={knowledgeBaseId}
              onOpenFile={onOpenFile}
            />
          );
        }
      }
    }, [mode, documentId, knowledgeBaseId, category, onOpenFile]);

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
