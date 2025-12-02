'use client';

import {
  closestCenter,
  CollisionDetection,
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  pointerWithin,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { Icon } from '@lobehub/ui';
import { useTheme } from 'antd-style';
import { FileText, FolderIcon } from 'lucide-react';
import { PropsWithChildren, memo, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Center, Flexbox } from 'react-layout-kit';

import FileIcon from '@/components/FileIcon';
import { useFileStore } from '@/store/file';

import { useResourceManagerStore } from './store';

/**
 * Custom collision detection that prefers specific folders over root drop zones
 * This prevents root drop zones from capturing drops meant for child folders
 */
const customCollisionDetection: CollisionDetection = (args) => {
  // First, get all collisions using pointerWithin
  const pointerCollisions = pointerWithin(args);

  // If there are collisions, filter out root drop zones if there are other valid targets
  if (pointerCollisions.length > 0) {
    const nonRootCollisions = pointerCollisions.filter((collision) => {
      const id = collision.id;
      return typeof id !== 'string' || !id.startsWith('__root__:');
    });

    // If we have non-root collisions, use those; otherwise fall back to all collisions
    if (nonRootCollisions.length > 0) {
      return nonRootCollisions;
    }
  }

  // Fall back to closest center if no pointer collisions
  return closestCenter(args);
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
          if (!item) return Promise.resolve();

          const isDocument =
            item.sourceType === 'document' ||
            item.fileType === 'custom/document' ||
            item.fileType === 'custom/folder';

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
    <DndContext
      collisionDetection={customCollisionDetection}
      onDragEnd={handleDragEnd}
      onDragStart={handleDragStart}
      sensors={sensors}
    >
      {children}
      {createPortal(
        <DragOverlay>
          {activeId && activeData ? (
            <Flexbox
              align={'center'}
              style={{
                background: theme.colorBgContainer,
                border: `1px solid ${theme.colorSplit}`,
                borderRadius: 8,
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                cursor: 'grabbing',
                height: 48,
                paddingInline: 16,
                width: 300,
              }}
            >
              <Flexbox align={'center'} horizontal>
                <Flexbox
                  align={'center'}
                  justify={'center'}
                  style={{ fontSize: 24, marginInlineEnd: 8, width: 24 }}
                >
                  {activeData.fileType === 'custom/folder' ? (
                    <Icon icon={FolderIcon} size={24} />
                  ) : activeData.fileType === 'custom/document' ? (
                    <Center height={24} width={24}>
                      <Icon icon={FileText} size={24} />
                    </Center>
                  ) : (
                    <FileIcon fileName={activeData.name} fileType={activeData.fileType} size={24} />
                  )}
                </Flexbox>
                <span
                  style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {activeData.name}
                </span>
                {selectedFileIds.includes(activeId) && selectedFileIds.length > 1 && (
                  <div
                    style={{
                      background: theme.colorPrimary,
                      borderRadius: 10,
                      color: theme.colorTextLightSolid,
                      fontSize: 12,
                      height: 20,
                      lineHeight: '20px',
                      marginLeft: 8,
                      paddingInline: 6,
                    }}
                  >
                    {selectedFileIds.length}
                  </div>
                )}
              </Flexbox>
            </Flexbox>
          ) : null}
        </DragOverlay>,
        document.body,
      )}
    </DndContext>
  );
});

DndContextWrapper.displayName = 'DndContextWrapper';

