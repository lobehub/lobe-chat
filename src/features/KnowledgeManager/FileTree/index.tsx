'use client';

import { Icon } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { FileText } from 'lucide-react';
import { memo, useCallback, useEffect, useState } from 'react';
import { Flexbox } from 'react-layout-kit';
import { useNavigate } from 'react-router-dom';

import { useFolderPath } from '@/app/[variants]/(main)/knowledge/hooks/useFolderPath';
import FileIcon from '@/components/FileIcon';
import FolderTree, { FolderTreeItem as BaseFolderTreeItem } from '@/features/KnowledgeManager/components/FolderTree';
import { fileService } from '@/services/file';

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

interface TreeItem extends BaseFolderTreeItem {
  fileType: string;
  isFolder: boolean;
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
  onLoadFolder: (folderId: string) => Promise<void>;
  onToggleFolder: (folderId: string) => void;
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
      // Render as folder using shared component
      return (
        <FolderTree
          expandedFolders={expandedFolders}
          items={[item]}
          loadedFolders={loadedFolders}
          onFolderClick={handleFolderClick}
          onLoadFolder={onLoadFolder}
          onToggleFolder={onToggleFolder}
          selectedKey={selectedKey}
        />
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

  const [items, setItems] = useState<TreeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [loadedFolders, setLoadedFolders] = useState<Set<string>>(new Set());

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

  // Fetch root level data
  useEffect(() => {
    const fetchRootData = async () => {
      setLoading(true);
      try {
        const data = await fileService.getKnowledgeItems({
          knowledgeBaseId,
          parentId: null,
          showFilesInKnowledgeBase: false,
        });

        const mappedItems: TreeItem[] = data.map((item) => ({
          children: undefined,
          fileType: item.fileType,
          id: item.id,
          isFolder: item.fileType === 'custom/folder',
          name: item.name,
          slug: item.slug,
          sourceType: item.sourceType,
        }));

        setItems(sortItems(mappedItems));
      } catch (error) {
        console.error('Failed to load root files:', error);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRootData();
  }, [knowledgeBaseId, sortItems]);

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

        setItems((prevItems) => {
          const updateItem = (items: TreeItem[]): TreeItem[] => {
            return items.map((item) => {
              const itemKey = item.slug || item.id;
              if (itemKey === folderId) {
                return { ...item, children: sortedChildren as TreeItem[] };
              }
              if (item.children) {
                return { ...item, children: updateItem(item.children as TreeItem[]) };
              }
              return item;
            });
          };
          return updateItem(prevItems);
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

  if (loading) {
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
