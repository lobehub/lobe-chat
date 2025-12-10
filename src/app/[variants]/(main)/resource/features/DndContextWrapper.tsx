'use client';

import {
  CollisionDetection,
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  closestCorners,
  pointerWithin,
  rectIntersection,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { Icon } from '@lobehub/ui';
import { useTheme } from 'antd-style';
import { FileText, FolderIcon } from 'lucide-react';
import { PropsWithChildren, createContext, memo, useContext, useState } from 'react';
import { createPortal } from 'react-dom';
import { Flexbox } from 'react-layout-kit';

import FileIcon from '@/components/FileIcon';
import { useFileStore } from '@/store/file';

import { useResourceManagerStore } from './store';

/**
 * Context to track if drag is currently active
 * Used to optimize droppable zones - only activate them during active drag
 */
const DragActiveContext = createContext<boolean>(false);

/**
 * Hook to check if drag is currently active
 * Use this to conditionally enable droppable zones for performance optimization
 */
export const useDragActive = () => useContext(DragActiveContext);

/**
 * Custom collision detection that prefers specific folders over root drop zones
 * This prevents root drop zones from capturing drops meant for child folders
 */
const customCollisionDetection: CollisionDetection = (args) => {
  // First, try pointerWithin for precise detection
  const pointerCollisions = pointerWithin(args);

  // If pointer is within a droppable, prefer non-root targets
  if (pointerCollisions.length > 0) {
    const nonRootCollisions = pointerCollisions.filter((collision) => {
      const id = collision.id;
      return typeof id !== 'string' || !id.startsWith('__root__:');
    });

    if (nonRootCollisions.length > 0) {
      return nonRootCollisions;
    }

    return pointerCollisions;
  }

  // If no pointer collisions, try rectIntersection for more forgiving detection
  const rectCollisions = rectIntersection(args);

  if (rectCollisions.length > 0) {
    const nonRootCollisions = rectCollisions.filter((collision) => {
      const id = collision.id;
      return typeof id !== 'string' || !id.startsWith('__root__:');
    });

    if (nonRootCollisions.length > 0) {
      return nonRootCollisions;
    }

    return rectCollisions;
  }

  // Finally, fall back to closestCorners for best UX
  const cornerCollisions = closestCorners(args);

  if (cornerCollisions.length > 0) {
    const nonRootCollisions = cornerCollisions.filter((collision) => {
      const id = collision.id;
      return typeof id !== 'string' || !id.startsWith('__root__:');
    });

    if (nonRootCollisions.length > 0) {
      return nonRootCollisions;
    }
  }

  // Last resort: return all corner collisions or empty array
  return cornerCollisions;
};

/**
 * DndContext wrapper for resource drag-and-drop
 * Must be used within ResourceManagerProvider
 */
export const DndContextWrapper = memo<PropsWithChildren>(({ children }) => {
  const theme = useTheme();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeData, setActiveData] = useState<any>(null);
  const updateDocument = useFileStore((s) => s.updateDocument);
  const moveFileToFolder = useFileStore((s) => s.moveFileToFolder);
  const fileList = useFileStore((s) => s.fileList);
  const selectedFileIds = useResourceManagerStore((s) => s.selectedFileIds);
  const setSelectedFileIds = useResourceManagerStore((s) => s.setSelectedFileIds);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    setActiveData(event.active.data.current);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const overData = over.data.current;
      const isDraggingSelection = selectedFileIds.includes(active.id as string);
      const itemsToMove = isDraggingSelection ? selectedFileIds : [active.id as string];

      if (overData?.isFolder) {
        const isRootDrop = typeof over.id === 'string' && over.id.startsWith('__root__:');
        const targetParentId = isRootDrop ? null : (over.id as string);

        const pools = itemsToMove.map((id) => {
          const item = fileList.find((f) => f.id === id);

          // Fallback to active drag data if item not in fileList (e.g., from tree lazy-loaded folders)
          const itemData = item || (id === active.id ? active.data.current : null);
          if (!itemData) return Promise.resolve();

          const isDocument =
            itemData.sourceType === 'document' ||
            itemData.fileType === 'custom/document' ||
            itemData.fileType === 'custom/folder';

          if (isDocument) {
            return updateDocument(id, { parentId: targetParentId });
          } else {
            return moveFileToFolder(id, targetParentId);
          }
        });

        Promise.all(pools).then(() => {
          if (isDraggingSelection) {
            setSelectedFileIds([]);
          }
        });
      }
    }
    setActiveId(null);
    setActiveData(null);
  };

  return (
    <DragActiveContext.Provider value={activeId !== null}>
      <DndContext
        collisionDetection={customCollisionDetection}
        onDragEnd={handleDragEnd}
        onDragStart={handleDragStart}
        sensors={sensors}
      >
        {children}
        {createPortal(
          <DragOverlay dropAnimation={null}>
            {activeId && activeData ? (
              <Flexbox
                align={'center'}
                gap={12}
                horizontal
                paddingInline={12}
                style={{
                  background: theme.colorBgElevated,
                  border: `1px solid ${theme.colorPrimaryBorder}`,
                  borderRadius: theme.borderRadiusLG,
                  boxShadow: theme.boxShadow,
                  cursor: 'grabbing',
                  height: 44,
                  maxWidth: 320,
                  minWidth: 200,
                }}
              >
                <Flexbox
                  align={'center'}
                  justify={'center'}
                  style={{
                    color: theme.colorPrimary,
                    flexShrink: 0,
                  }}
                >
                  {activeData.fileType === 'custom/folder' ? (
                    <Icon icon={FolderIcon} size={20} />
                  ) : activeData.fileType === 'custom/document' ? (
                    <Icon icon={FileText} size={20} />
                  ) : (
                    <FileIcon fileName={activeData.name} fileType={activeData.fileType} size={20} />
                  )}
                </Flexbox>
                <span
                  style={{
                    color: theme.colorText,
                    flex: 1,
                    fontSize: theme.fontSize,
                    fontWeight: 500,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {activeData.name}
                </span>
                {selectedFileIds.includes(activeId) && selectedFileIds.length > 1 && (
                  <Flexbox
                    align={'center'}
                    justify={'center'}
                    style={{
                      background: theme.colorPrimary,
                      borderRadius: theme.borderRadiusSM,
                      color: theme.colorTextLightSolid,
                      flexShrink: 0,
                      fontSize: 12,
                      fontWeight: 600,
                      height: 22,
                      minWidth: 22,
                      paddingInline: 6,
                    }}
                  >
                    {selectedFileIds.length}
                  </Flexbox>
                )}
              </Flexbox>
            ) : null}
          </DragOverlay>,
          document.body,
        )}
      </DndContext>
    </DragActiveContext.Provider>
  );
});

DndContextWrapper.displayName = 'DndContextWrapper';
