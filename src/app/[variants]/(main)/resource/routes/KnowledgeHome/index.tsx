'use client';

import { createStyles } from 'antd-style';
import { memo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';
import { useMediaQuery } from 'react-responsive';
import { useParams, useSearchParams } from 'react-router-dom';

import NProgress from '@/components/NProgress';
import PanelTitle from '@/components/PanelTitle';
import FilePanel from '@/features/FileSidePanel';
import ResourceManager from '@/features/ResourceManager';
import FileTree from '@/features/ResourceManager/FileTree';
import TogglePanelButton from '@/features/ResourceManager/Header/TogglePanelButton';
import { useShowMobileWorkspace } from '@/hooks/useShowMobileWorkspace';
import { knowledgeBaseSelectors, useKnowledgeBaseStore } from '@/store/knowledgeBase';
import { FilesTabs } from '@/types/files';

import LibraryHead from '../../components/LibraryMenu/Head';
import { useFileCategory } from '../../hooks/useFileCategory';
import { useFolderPath } from '../../hooks/useFolderPath';
import { useKnowledgeBaseItem } from '../../hooks/useKnowledgeItem';
import { ResourceManagerProvider } from './ResourceManagerProvider';
import Container from './layout/Container';
import RegisterHotkeys from './layout/RegisterHotkeys';
import CategoryMenu from './menu/CategoryMenu';
import Collection from './menu/KnowledgeBase';
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
  return (
    <>
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
    </>
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

// Main Knowledge Home Page Content
const KnowledgeHomePageContent = memo(() => {
  const isMobile = useMediaQuery({ maxWidth: 768 });

  return isMobile ? <MobileLayout /> : <DesktopLayout />;
});

KnowledgeHomePageContent.displayName = 'KnowledgeHomePageContent';

// Main Knowledge Home Page with Provider
const KnowledgeHomePage = memo(() => {
  return (
    <ResourceManagerProvider>
      <KnowledgeHomePageContent />
    </ResourceManagerProvider>
  );
});

KnowledgeHomePage.displayName = 'KnowledgeHomePage';

export default KnowledgeHomePage;
