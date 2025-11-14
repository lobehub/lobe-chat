'use client';

import { createStyles } from 'antd-style';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';
import { useMediaQuery } from 'react-responsive';
import { useParams } from 'react-router-dom';

import NProgress from '@/components/NProgress';
import PanelTitle from '@/components/PanelTitle';
import FilePanel from '@/features/FileSidePanel';
import KnowledgeItemManager from '@/features/KnowledgeManager';
import TogglePanelButton from '@/features/KnowledgeManager/Header/TogglePanelButton';
import { useShowMobileWorkspace } from '@/hooks/useShowMobileWorkspace';
import { FilesTabs } from '@/types/files';

import { useFileCategory } from '../../hooks/useFileCategory';
import FileModalQueryRoute from '../../shared/FileModalQueryRoute';
import { useSetFileModalId } from '../../shared/useFileQueryParam';
import Container from './layout/Container';
import RegisterHotkeys from './layout/RegisterHotkeys';
import CategoryMenu from './menu/CategoryMenu';
import Collection from './menu/KnowledgeBase';

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

// Main files list component
const MainContent = memo(() => {
  const { id } = useParams<{ id: string }>();
  const [category] = useFileCategory();
  const setFileModalId = useSetFileModalId();

  return (
    <KnowledgeItemManager
      category={category}
      documentId={id}
      onOpenFile={setFileModalId}
      title={`${category as FilesTabs}`}
    />
  );
});

MainContent.displayName = 'FilesListPage';

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
      <FileModalQueryRoute />
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
      <FileModalQueryRoute />
    </>
  );
});

MobileLayout.displayName = 'MobileLayout';

// Main Knowledge Home Page
const KnowledgeHomePage = memo(() => {
  const isMobile = useMediaQuery({ maxWidth: 768 });

  return isMobile ? <MobileLayout /> : <DesktopLayout />;
});

KnowledgeHomePage.displayName = 'KnowledgeHomePage';

export default KnowledgeHomePage;
