'use client';

import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { Icon } from '@lobehub/ui';
import { useTheme } from 'antd-style';
import { FileText, FolderIcon } from 'lucide-react';
import { memo, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Center, Flexbox } from 'react-layout-kit';
import { useParams, useSearchParams } from 'react-router-dom';

import Container from '@/app/[variants]/(main)/resource/(home)/features/Container';
import FileIcon from '@/components/FileIcon';
import NProgress from '@/components/NProgress';
import ResourceManager from '@/features/ResourceManager';
import { useFileStore } from '@/store/file';
import { FilesTabs } from '@/types/files';

import { useFileCategory } from '../features/hooks/useFileCategory';
import { useResourceManagerStore } from '../features/store';

const MainContent = memo(() => {
  const { id } = useParams<{ id: string }>();
  const [category] = useFileCategory();
  const [searchParams] = useSearchParams();
  const setMode = useResourceManagerStore((s) => s.setMode);
  const setCurrentViewItemId = useResourceManagerStore((s) => s.setCurrentViewItemId);

  // Sync URL query parameter with store on mount and when it changes
  useEffect(() => {
    const fileId = searchParams.get('file');
    if (fileId && !fileId.startsWith('doc')) {
      setCurrentViewItemId(fileId);
      setMode('file');
    }
  }, [searchParams, setCurrentViewItemId, setMode]);

  return <ResourceManager category={category} documentId={id} title={`${category as FilesTabs}`} />;
});

MainContent.displayName = 'HomeMainContent';

const DesktopLayout = memo(() => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeData, setActiveData] = useState<any>(null);
  const updateDocument = useFileStore((s) => s.updateDocument);
  const moveFileToFolder = useFileStore((s) => s.moveFileToFolder);
  const selectedFileIds = useResourceManagerStore((s) => s.selectedFileIds);
  const setSelectedFileIds = useResourceManagerStore((s) => s.setSelectedFileIds);
  const fileList = useFileStore((s) => s.fileList);
  const theme = useTheme();

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
    <DndContext onDragEnd={handleDragEnd} onDragStart={handleDragStart} sensors={sensors}>
      <NProgress />
      <Container>
        <MainContent />
      </Container>
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

DesktopLayout.displayName = 'ResourceHomeDesktopLayout';

const ResourceHomePage = memo(() => {
  return <DesktopLayout />;
});

ResourceHomePage.displayName = 'ResourceHomePage';

export default ResourceHomePage;
