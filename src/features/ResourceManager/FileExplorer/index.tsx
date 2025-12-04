'use client';

import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import EmptyStatus from './EmptyStatus';
import Header from './Header';
import ListView from './ListView';
import Skeleton from './ListView/Skeleton';
import MasonryView from './MasonryView';
import { useFileExplorer } from './useFileExplorer';

interface FileExplorerProps {
  category?: string;
  knowledgeBaseId?: string;
  onOpenFile?: (id: string) => void;
}

const FileExplorer = memo<FileExplorerProps>(({ knowledgeBaseId, category, onOpenFile }) => {
  const {
    // Data
    data,
    isLoading,
    pendingRenameItemId,

    // State
    isMasonryReady,
    isTransitioning,
    selectFileIds,
    showEmptyStatus,
    viewMode,

    // Handlers
    handleSelectionChange,
    onActionClick,
    setSelectedFileIds,
    setViewMode,
  } = useFileExplorer({ category, knowledgeBaseId });

  return (
    <Flexbox height={'100%'}>
      <Header
        category={category}
        knowledgeBaseId={knowledgeBaseId}
        onActionClick={onActionClick}
        onViewChange={setViewMode}
        selectCount={selectFileIds.length}
        viewMode={viewMode}
      />
      {showEmptyStatus ? (
        <EmptyStatus knowledgeBaseId={knowledgeBaseId} showKnowledgeBase={!knowledgeBaseId} />
      ) : isLoading || (viewMode === 'list' && isTransitioning) ? (
        <Skeleton />
      ) : viewMode === 'list' ? (
        <ListView
          data={data}
          knowledgeBaseId={knowledgeBaseId}
          onSelectionChange={handleSelectionChange}
          pendingRenameItemId={pendingRenameItemId}
          selectFileIds={selectFileIds}
        />
      ) : (
        <MasonryView
          data={data}
          isMasonryReady={isMasonryReady}
          isTransitioning={isTransitioning}
          knowledgeBaseId={knowledgeBaseId}
          onOpenFile={onOpenFile}
          selectFileIds={selectFileIds}
          setSelectedFileIds={setSelectedFileIds}
        />
      )}
    </Flexbox>
  );
});

export default FileExplorer;
