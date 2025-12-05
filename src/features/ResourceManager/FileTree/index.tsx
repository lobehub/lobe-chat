'use client';

import { CaretDownFilled, LoadingOutlined } from '@ant-design/icons';
import { useDroppable } from '@dnd-kit/core';
import { ActionIcon, Block, Icon } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { motion } from 'framer-motion';
import { FileText, FolderIcon, FolderOpenIcon } from 'lucide-react';
import React, { memo, useCallback, useReducer } from 'react';
import { Flexbox } from 'react-layout-kit';
import { useNavigate } from 'react-router-dom';

import { useFolderPath } from '@/app/[variants]/(main)/resource/features/hooks/useFolderPath';
import { useResourceManagerStore } from '@/app/[variants]/(main)/resource/features/store';
import FileIcon from '@/components/FileIcon';
import { fileService } from '@/services/file';
import { useFileStore } from '@/store/file';

import TreeSkeleton from './TreeSkeleton';

// Module-level state to persist expansion across re-renders
const treeState = new Map<
  string,
  {
    expandedFolders: Set<string>;
    folderChildrenCache: Map<string, any[]>;
    loadedFolders: Set<string>;
    loadingFolders: Set<string>;
  }
>();

const getTreeState = (knowledgeBaseId: string) => {
  if (!treeState.has(knowledgeBaseId)) {
    treeState.set(knowledgeBaseId, {
      expandedFolders: new Set(),
      folderChildrenCache: new Map(),
      loadedFolders: new Set(),
      loadingFolders: new Set(),
    });
  }
  return treeState.get(knowledgeBaseId)!;
};

const useStyles = createStyles(({ css, token }) => ({
  fileItemDragOver: css`
    background-color: ${token.colorFillSecondary} !important;
    outline: 2px dashed ${token.colorPrimary};
    outline-offset: -2px;
  `,
  rootDropZone: css`
    min-height: 100%;
    transition: background-color 0.2s;
  `,
  rootDropZoneActive: css`
    background-color: ${token.colorFillQuaternary};
    outline: 2px dashed ${token.colorPrimary};
    outline-offset: -4px;
  `,
}));

interface TreeItem {
  children?: TreeItem[];
  fileType: string;
  id: string;
  isFolder: boolean;
  name: string;
  slug?: string | null;
  sourceType?: string;
}

interface FileTreeProps {
  knowledgeBaseId: string;
}

// Recursive component to render folder and file tree
const FileTreeItem = memo<{
  expandedFolders: Set<string>;
  folderChildrenCache: Map<string, TreeItem[]>;
  item: TreeItem;
  knowledgeBaseId: string;
  level?: number;
  loadedFolders: Set<string>;
  loadingFolders: Set<string>;
  onLoadFolder: (_: string) => Promise<void>;
  onToggleFolder: (_: string) => void;
  selectedKey: string | null;
  updateKey?: number;
}>(
  ({
    item,
    level = 0,
    expandedFolders,
    loadedFolders,
    loadingFolders,
    onToggleFolder,
    onLoadFolder,
    selectedKey,
    knowledgeBaseId,
    updateKey,
    folderChildrenCache,
  }) => {
    const { styles, cx } = useStyles();
    const navigate = useNavigate();
    const { currentFolderSlug } = useFolderPath();

    const [setMode, setCurrentViewItemId] = useResourceManagerStore((s) => [
      s.setMode,
      s.setCurrentViewItemId,
    ]);

    const itemKey = item.slug || item.id;

    // Dynamically look up children from cache instead of using static item.children
    const children = folderChildrenCache.get(itemKey);

    const { setNodeRef, isOver } = useDroppable({
      data: {
        fileType: 'custom/folder',
        isFolder: true,
        name: item.name,
      },
      disabled: !item.isFolder,
      id: item.id,
    });

    const handleFileClick = useCallback(() => {
      // Open file modal using slug-based routing
      const currentPath = currentFolderSlug
        ? `/resource/library/${knowledgeBaseId}/${currentFolderSlug}`
        : `/resource/library/${knowledgeBaseId}`;

      setCurrentViewItemId(itemKey);
      if (itemKey.startsWith('doc')) {
        setMode('page');
      } else {
        // Set mode to 'file' immediately to prevent flickering to list view
        setMode('file');
        navigate(`${currentPath}?file=${itemKey}`);
      }
    }, [itemKey, currentFolderSlug, knowledgeBaseId, navigate, setMode, setCurrentViewItemId]);

    const handleFolderClick = useCallback(
      (folderId: string, folderSlug?: string | null) => {
        const navKey = folderSlug || folderId;
        navigate(`/resource/library/${knowledgeBaseId}/${navKey}`);

        setMode('files');
      },
      [knowledgeBaseId, navigate],
    );

    if (item.isFolder) {
      const isExpanded = expandedFolders.has(itemKey);
      const isActive = selectedKey === itemKey;
      const isLoading = loadingFolders.has(itemKey);

      const handleToggle = async () => {
        // Toggle folder expansion
        onToggleFolder(itemKey);

        // Always load/refetch children when expanding
        if (!isExpanded) {
          await onLoadFolder(itemKey);
        }
      };

      return (
        <Flexbox gap={2} ref={setNodeRef}>
          <Block
            align={'center'}
            className={cx(isOver && styles.fileItemDragOver)}
            clickable
            gap={8}
            height={36}
            horizontal
            onClick={() => handleFolderClick(item.id, item.slug)}
            paddingInline={4}
            style={{ paddingInlineStart: level * 16 + 4 }}
            variant={isActive ? 'filled' : 'borderless'}
          >
            {isLoading ? (
              <ActionIcon icon={LoadingOutlined as any} size={'small'} spin />
            ) : (
              <motion.div
                animate={{ rotate: isExpanded ? 0 : -90 }}
                initial={false}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
              >
                <ActionIcon
                  icon={CaretDownFilled as any}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggle();
                  }}
                  size={'small'}
                />
              </motion.div>
            )}
            <Flexbox
              align={'center'}
              flex={1}
              gap={8}
              horizontal
              style={{ minHeight: 28, minWidth: 0, overflow: 'hidden' }}
            >
              <Icon icon={isExpanded ? FolderOpenIcon : FolderIcon} size={18} />
              <span
                style={{
                  flex: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {item.name}
              </span>
            </Flexbox>
          </Block>

          {isExpanded && children && children.length > 0 && (
            <motion.div
              animate={{ height: 'auto', opacity: 1 }}
              initial={false}
              style={{ overflow: 'hidden' }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
            >
              <Flexbox gap={2}>
                {children.map((child) => (
                  <FileTreeItem
                    expandedFolders={expandedFolders}
                    folderChildrenCache={folderChildrenCache}
                    item={child}
                    key={child.id}
                    knowledgeBaseId={knowledgeBaseId}
                    level={level + 1}
                    loadedFolders={loadedFolders}
                    loadingFolders={loadingFolders}
                    onLoadFolder={onLoadFolder}
                    onToggleFolder={onToggleFolder}
                    selectedKey={selectedKey}
                    updateKey={updateKey}
                  />
                ))}
              </Flexbox>
            </motion.div>
          )}
        </Flexbox>
      );
    }

    // Render as file
    const isActive = selectedKey === itemKey;
    return (
      <Flexbox gap={2}>
        <Block
          align={'center'}
          clickable
          gap={8}
          height={36}
          horizontal
          onClick={handleFileClick}
          paddingInline={4}
          style={{ paddingInlineStart: level * 16 + 4 }}
          variant={isActive ? 'filled' : 'borderless'}
        >
          <div style={{ width: 24 }} />
          <Flexbox
            align={'center'}
            flex={1}
            gap={8}
            horizontal
            style={{ minHeight: 28, minWidth: 0, overflow: 'hidden' }}
          >
            {item.sourceType === 'document' ? (
              <Icon icon={FileText} size={18} />
            ) : (
              <FileIcon fileName={item.name} fileType={item.fileType} size={18} />
            )}
            <span
              style={{
                flex: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {item.name}
            </span>
          </Flexbox>
        </Block>
      </Flexbox>
    );
  },
);

FileTreeItem.displayName = 'FileTreeItem';

const FileTree = memo<FileTreeProps>(({ knowledgeBaseId }) => {
  const { styles, cx } = useStyles();
  const { currentFolderSlug } = useFolderPath();

  const useFetchKnowledgeItems = useFileStore((s) => s.useFetchKnowledgeItems);

  // Force re-render when tree state changes
  const [updateKey, forceUpdate] = useReducer((x) => x + 1, 0);

  // Get the persisted state for this knowledge base
  const state = getTreeState(knowledgeBaseId);
  const { expandedFolders, loadedFolders, folderChildrenCache, loadingFolders } = state;

  // Special droppable ID for root folder
  const ROOT_DROP_ID = `__root__:${knowledgeBaseId}`;

  const { setNodeRef: setRootDropRef, isOver: isRootDropOver } = useDroppable({
    data: {
      fileType: 'custom/folder',
      isFolder: true,
      name: 'Root',
    },
    id: ROOT_DROP_ID,
  });

  // Fetch root level data using SWR
  const { data: rootData, isLoading } = useFetchKnowledgeItems({
    knowledgeBaseId,
    parentId: null,
    showFilesInKnowledgeBase: false,
  });

  // Sort items: folders first, then files
  const sortItems = useCallback(<T extends TreeItem>(items: T[]): T[] => {
    return [...items].sort((a, b) => {
      // Folders first
      if (a.isFolder && !b.isFolder) return -1;
      if (!a.isFolder && b.isFolder) return 1;
      // Then alphabetically by name
      return a.name.localeCompare(b.name);
    });
  }, []);

  // Convert root data to tree items
  const items: TreeItem[] = React.useMemo(() => {
    if (!rootData) return [];

    const mappedItems: TreeItem[] = rootData.map((item) => ({
      fileType: item.fileType,
      id: item.id,
      isFolder: item.fileType === 'custom/folder',
      name: item.name,
      slug: item.slug,
      sourceType: item.sourceType,
    }));

    return sortItems(mappedItems);
  }, [rootData, sortItems, updateKey]);

  const handleLoadFolder = useCallback(
    async (folderId: string) => {
      // Set loading state
      state.loadingFolders.add(folderId);
      forceUpdate();

      try {
        const data = await fileService.getKnowledgeItems({
          knowledgeBaseId,
          parentId: folderId,
          showFilesInKnowledgeBase: false,
        });

        const childItems: TreeItem[] = data.map((item) => ({
          fileType: item.fileType,
          id: item.id,
          isFolder: item.fileType === 'custom/folder',
          name: item.name,
          slug: item.slug,
          sourceType: item.sourceType,
        }));

        // Sort children: folders first, then files
        const sortedChildren = sortItems(childItems);

        // Store children in cache
        state.folderChildrenCache.set(folderId, sortedChildren);
        state.loadedFolders.add(folderId);
      } catch (error) {
        console.error('Failed to load folder contents:', error);
      } finally {
        // Clear loading state
        state.loadingFolders.delete(folderId);
        // Trigger re-render
        forceUpdate();
      }
    },
    [knowledgeBaseId, sortItems, state, forceUpdate],
  );

  const handleToggleFolder = useCallback(
    (folderId: string) => {
      if (state.expandedFolders.has(folderId)) {
        state.expandedFolders.delete(folderId);
      } else {
        state.expandedFolders.add(folderId);
      }
      // Trigger re-render
      forceUpdate();
    },
    [state, forceUpdate],
  );

  if (isLoading) {
    return <TreeSkeleton />;
  }

  return (
    <Flexbox
      className={cx(styles.rootDropZone, isRootDropOver && styles.rootDropZoneActive)}
      gap={2}
      paddingInline={4}
      ref={setRootDropRef}
    >
      {items.map((item) => (
        <FileTreeItem
          expandedFolders={expandedFolders}
          folderChildrenCache={folderChildrenCache}
          item={item}
          key={item.id}
          knowledgeBaseId={knowledgeBaseId}
          loadedFolders={loadedFolders}
          loadingFolders={loadingFolders}
          onLoadFolder={handleLoadFolder}
          onToggleFolder={handleToggleFolder}
          selectedKey={currentFolderSlug}
          updateKey={updateKey}
        />
      ))}
    </Flexbox>
  );
});

FileTree.displayName = 'FileTree';

export default FileTree;
