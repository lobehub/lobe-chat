'use client';

import { CaretDownFilled } from '@ant-design/icons';
import { ActionIcon, Icon } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { motion } from 'framer-motion';
import { FileText, FolderIcon, FolderOpenIcon } from 'lucide-react';
import React, { memo, useCallback, useEffect, useState } from 'react';
import { Flexbox } from 'react-layout-kit';
import { useNavigate } from 'react-router-dom';

import { useFolderPath } from '@/app/[variants]/(main)/knowledge/hooks/useFolderPath';
import FileIcon from '@/components/FileIcon';
import { fileService } from '@/services/file';
import { useFileStore } from '@/store/file';

import TreeSkeleton from './TreeSkeleton';

const useStyles = createStyles(({ css, token }) => ({
  fileItem: css`
    cursor: pointer;

    padding-block: 4px;
    padding-inline: 8px;

    color: ${token.colorText};

    transition: background-color 0.2s;

    &:hover {
      background-color: ${token.colorFillTertiary};
    }
  `,
  fileItemActive: css`
    background-color: ${token.colorFillSecondary};
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
  item: TreeItem;
  knowledgeBaseId: string;
  level?: number;
  loadedFolders: Set<string>;
  onLoadFolder: (_: string) => Promise<void>;
  onToggleFolder: (_: string) => void;
  selectedKey: string | null;
}>(
  ({
    item,
    level = 0,
    expandedFolders,
    loadedFolders,
    onToggleFolder,
    onLoadFolder,
    selectedKey,
    knowledgeBaseId,
  }) => {
    const { styles, cx } = useStyles();
    const navigate = useNavigate();
    const { currentFolderSlug } = useFolderPath();

    const itemKey = item.slug || item.id;

    console.log('RENDERING ITEM', JSON.stringify(item, null, 2));

    const handleFileClick = useCallback(() => {
      // Open file modal using slug-based routing
      const currentPath = currentFolderSlug
        ? `/knowledge/repo/${knowledgeBaseId}/${currentFolderSlug}`
        : `/knowledge/repo/${knowledgeBaseId}`;
      navigate(`${currentPath}?file=${itemKey}`);
    }, [itemKey, currentFolderSlug, knowledgeBaseId, navigate]);

    const handleFolderClick = useCallback(
      (folderId: string, folderSlug?: string | null) => {
        const navKey = folderSlug || folderId;
        navigate(`/knowledge/repo/${knowledgeBaseId}/${navKey}`);
      },
      [knowledgeBaseId, navigate],
    );

    if (item.isFolder) {
      const isExpanded = expandedFolders.has(itemKey);
      const isActive = selectedKey === itemKey;

      const handleToggle = async () => {
        // Toggle folder expansion
        onToggleFolder(itemKey);

        // Load children if not already loaded
        if (!isExpanded && !loadedFolders.has(itemKey)) {
          await onLoadFolder(itemKey);
        }
      };

      return (
        <Flexbox gap={2}>
          <Flexbox
            align={'center'}
            className={cx(styles.fileItem, isActive && styles.fileItemActive)}
            horizontal
            onClick={() => handleFolderClick(item.id, item.slug)}
            style={{ paddingInlineStart: level * 16 + 8 }}
          >
            <motion.div
              animate={{ rotate: isExpanded ? 0 : -90 }}
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
            <Flexbox
              align={'center'}
              flex={1}
              gap={8}
              horizontal
              style={{ minHeight: 28, minWidth: 0 }}
            >
              <Icon icon={isExpanded ? FolderOpenIcon : FolderIcon} size={16} />
              <span
                style={{
                  flex: 1,
                  fontSize: 14,
                  lineHeight: '20px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {item.name}
              </span>
            </Flexbox>
          </Flexbox>

          {isExpanded && item.children && item.children.length > 0 && (
            <motion.div
              animate={{ height: 'auto', opacity: 1 }}
              initial={{ height: 0, opacity: 0 }}
              style={{ overflow: 'hidden' }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
            >
              <Flexbox gap={2}>
                {item.children.map((child) => (
                  <FileTreeItem
                    expandedFolders={expandedFolders}
                    item={child}
                    key={child.id}
                    knowledgeBaseId={knowledgeBaseId}
                    level={level + 1}
                    loadedFolders={loadedFolders}
                    onLoadFolder={onLoadFolder}
                    onToggleFolder={onToggleFolder}
                    selectedKey={selectedKey}
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
        <Flexbox
          align={'center'}
          className={cx(styles.fileItem, isActive && styles.fileItemActive)}
          horizontal
          onClick={handleFileClick}
          style={{ paddingInlineStart: level * 16 + 8 }}
        >
          <div style={{ width: 24 }} />
          <Flexbox
            align={'center'}
            flex={1}
            gap={8}
            horizontal
            style={{ minHeight: 28, minWidth: 0 }}
          >
            {item.sourceType === 'document' ? (
              <Icon icon={FileText} size={16} />
            ) : (
              <FileIcon fileName={item.name} fileType={item.fileType} size={16} />
            )}
            <span
              style={{
                flex: 1,
                fontSize: 14,
                lineHeight: '20px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {item.name}
            </span>
          </Flexbox>
        </Flexbox>
      </Flexbox>
    );
  },
);

FileTreeItem.displayName = 'FileTreeItem';

const FileTree = memo<FileTreeProps>(({ knowledgeBaseId }) => {
  const { currentFolderSlug } = useFolderPath();

  const useFetchKnowledgeItems = useFileStore((s) => s.useFetchKnowledgeItems);

  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [loadedFolders, setLoadedFolders] = useState<Set<string>>(new Set());
  const [folderChildrenCache, setFolderChildrenCache] = useState<Map<string, TreeItem[]>>(
    new Map(),
  );

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

    const mappedItems: TreeItem[] = rootData.map((item) => {
      const itemKey = item.slug || item.id;
      const children = folderChildrenCache.get(itemKey);

      return {
        children,
        fileType: item.fileType,
        id: item.id,
        isFolder: item.fileType === 'custom/folder',
        name: item.name,
        slug: item.slug,
        sourceType: item.sourceType,
      };
    });

    return sortItems(mappedItems);
  }, [rootData, sortItems, folderChildrenCache]);

  // Clear folder cache when root data changes (e.g., when a folder is deleted)
  useEffect(() => {
    setFolderChildrenCache(new Map());
    setLoadedFolders(new Set());
    setExpandedFolders(new Set());
  }, [rootData]);

  const handleLoadFolder = useCallback(
    async (folderId: string) => {
      if (loadedFolders.has(folderId)) return;

      try {
        const data = await fileService.getKnowledgeItems({
          knowledgeBaseId,
          parentId: folderId,
          showFilesInKnowledgeBase: false,
        });

        const childItems: TreeItem[] = data.map((item) => ({
          children: undefined,
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
        setFolderChildrenCache((prev) => {
          const next = new Map(prev);
          next.set(folderId, sortedChildren);
          return next;
        });

        setLoadedFolders((prev) => new Set([...prev, folderId]));
      } catch (error) {
        console.error('Failed to load folder contents:', error);
      }
    },
    [knowledgeBaseId, loadedFolders, sortItems],
  );

  const handleToggleFolder = useCallback((folderId: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  }, []);

  if (isLoading) {
    return <TreeSkeleton />;
  }

  return (
    <Flexbox gap={2}>
      {items.map((item) => (
        <FileTreeItem
          expandedFolders={expandedFolders}
          item={item}
          key={item.id}
          knowledgeBaseId={knowledgeBaseId}
          loadedFolders={loadedFolders}
          onLoadFolder={handleLoadFolder}
          onToggleFolder={handleToggleFolder}
          selectedKey={currentFolderSlug}
        />
      ))}
    </Flexbox>
  );
});

FileTree.displayName = 'FileTree';

export default FileTree;
