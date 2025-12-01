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
import { createStyles, useTheme } from 'antd-style';
import { FileText, FolderIcon } from 'lucide-react';
import { memo, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { Center, Flexbox } from 'react-layout-kit';
import { useMediaQuery } from 'react-responsive';
import { useParams, useSearchParams } from 'react-router-dom';

import FileIcon from '@/components/FileIcon';
import NProgress from '@/components/NProgress';
import PanelTitle from '@/components/PanelTitle';
import FilePanel from '@/features/FileSidePanel';
import ResourceManager from '@/features/ResourceManager';
import FileTree from '@/features/ResourceManager/FileTree';
import TogglePanelButton from '@/features/ResourceManager/Header/TogglePanelButton';
import { useShowMobileWorkspace } from '@/hooks/useShowMobileWorkspace';
import { useFileStore } from '@/store/file';
import { knowledgeBaseSelectors, useKnowledgeBaseStore } from '@/store/knowledgeBase';
import { FilesTabs } from '@/types/files';

import CategoryMenu from './components/CategoryMenu';
import Container from './components/Container';
import Collection from './components/KnowledgeBase';
import LibraryHead from './components/LibraryMenu/Head';
import RegisterHotkeys from './components/RegisterHotkeys';
import { ResourceManagerProvider } from './components/ResourceManagerProvider';
import { useFileCategory } from './hooks/useFileCategory';
import { useFolderPath } from './hooks/useFolderPath';
import { useKnowledgeBaseItem } from './hooks/useKnowledgeItem';
import { useResourceManagerStore } from './store';

const useStyles = createStyles(({ css, token }) => ({
  main: css`
    position: relative;
    overflow: hidden;
    background: ${token.colorBgLayout};
  `,
  sidebar: css`
    position: relative;

    &:hover .toggle-button {
      opacity: 1;
    }
  `,
  toggleButton: css`
    position: absolute;
    z-index: 10;
    inset-block-start: 8px;
    inset-inline-end: 8px;

    opacity: 0;

    transition: opacity ${token.motionDurationSlow};
  `,
}));

const Sidebar = memo(() => {
  const { t } = useTranslation('file');
  const { styles } = useStyles();
  const { knowledgeBaseId } = useFolderPath();

  // If we're in a library route, show library sidebar
  if (knowledgeBaseId) {
    return (
      <Flexbox className={styles.sidebar} gap={16} height={'100%'} style={{ paddingTop: 12 }}>
        <div className={`${styles.toggleButton} toggle-button`}>
          <TogglePanelButton />
        </div>
        <Flexbox paddingInline={12}>
          <LibraryHead id={knowledgeBaseId} />
        </Flexbox>
        <FileTree knowledgeBaseId={knowledgeBaseId} />
      </Flexbox>
    );
  }

  // Otherwise show category sidebar
  return (
    <Flexbox className={styles.sidebar} gap={16} height={'100%'}>
      <div className={`${styles.toggleButton} toggle-button`}>
        <TogglePanelButton />
      </div>
      <Flexbox paddingInline={8}>
        <PanelTitle desc={t('desc')} title={t('title')} />
        <CategoryMenu />
      </Flexbox>
      <Collection />
    </Flexbox>
  );
});

Sidebar.displayName = 'Sidebar';

// Main content component
const MainContent = memo(() => {
  const { id } = useParams<{ id: string }>();
  const { knowledgeBaseId } = useFolderPath();
  const [category] = useFileCategory();
  const [searchParams] = useSearchParams();
  const setMode = useResourceManagerStore((s) => s.setMode);
  const setCurrentViewItemId = useResourceManagerStore((s) => s.setCurrentViewItemId);

  // Load knowledge base data if we're in a library route
  useKnowledgeBaseItem(knowledgeBaseId || '');
  const libraryName = useKnowledgeBaseStore(
    knowledgeBaseSelectors.getKnowledgeBaseNameById(knowledgeBaseId || ''),
  );

  // Sync URL query parameter with store on mount and when it changes
  useEffect(() => {
    const fileId = searchParams.get('file');
    if (fileId) {
      setCurrentViewItemId(fileId);
      setMode('file');
    }
  }, [searchParams, setCurrentViewItemId, setMode]);

  return (
    <ResourceManager
      category={category}
      documentId={id}
      knowledgeBaseId={knowledgeBaseId || undefined}
      title={knowledgeBaseId ? libraryName : `${category as FilesTabs}`}
    />
  );
});

MainContent.displayName = 'MainContent';

const DesktopLayout = memo(() => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeData, setActiveData] = useState<any>(null);
  const updateDocument = useFileStore((s) => s.updateDocument);
  const moveFileToFolder = useFileStore((s) => s.moveFileToFolder);
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
      const currentActiveData = active.data.current;
      const overData = over.data.current;

      if (overData?.isFolder && currentActiveData) {
        const isDocument =
          currentActiveData.sourceType === 'document' ||
          currentActiveData.fileType === 'custom/document' ||
          currentActiveData.fileType === 'custom/folder';

        if (isDocument) {
          updateDocument(active.id as string, { parentId: over.id as string });
        } else {
          moveFileToFolder(active.id as string, over.id as string);
        }
      }
    }
    setActiveId(null);
    setActiveData(null);
  };

  return (
    <DndContext onDragEnd={handleDragEnd} onDragStart={handleDragStart} sensors={sensors}>
      <NProgress />
      <Flexbox
        height={'100%'}
        horizontal
        style={{ maxWidth: '100%', overflow: 'hidden', position: 'relative' }}
        width={'100%'}
      >
        <FilePanel>
          <Sidebar />
        </FilePanel>
        <Container>
          <MainContent />
        </Container>
      </Flexbox>
      <RegisterHotkeys />
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
                    <FileIcon
                      fileName={activeData.name}
                      fileType={activeData.fileType}
                      size={24}
                    />
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
              </Flexbox>
            </Flexbox>
          ) : null}
        </DragOverlay>,
        document.body,
      )}
    </DndContext>
  );
});

DesktopLayout.displayName = 'DesktopLayout';

const MobileLayout = memo(() => {
  const showMobileWorkspace = useShowMobileWorkspace();
  const { styles } = useStyles();

  return (
    <>
      <NProgress />
      <Flexbox
        className={styles.main}
        height="100%"
        style={showMobileWorkspace ? { display: 'none' } : undefined}
        width="100%"
      >
        <Sidebar />
      </Flexbox>
      <Flexbox
        className={styles.main}
        height="100%"
        style={showMobileWorkspace ? undefined : { display: 'none' }}
        width="100%"
      >
        <MainContent />
      </Flexbox>
    </>
  );
});

MobileLayout.displayName = 'MobileLayout';

const KnowledgeHomePageContent = memo(() => {
  const isMobile = useMediaQuery({ maxWidth: 768 });

  return isMobile ? <MobileLayout /> : <DesktopLayout />;
});

KnowledgeHomePageContent.displayName = 'KnowledgeHomePageContent';

// Main Knowledge Home Page with Provider
const ResourcePage = memo(() => {
  return (
    <ResourceManagerProvider>
      <KnowledgeHomePageContent />
    </ResourceManagerProvider>
  );
});

ResourcePage.displayName = 'ResourcePage';

export default ResourcePage;
