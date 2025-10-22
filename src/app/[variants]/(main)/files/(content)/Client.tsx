'use client';

import { App } from 'antd';
import { createStyles } from 'antd-style';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';
import { useMediaQuery } from 'react-responsive';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { useFileCategory } from '@/app/[variants]/(main)/files/hooks/useFileCategory';
import NProgress from '@/components/NProgress';
import PanelTitle from '@/components/PanelTitle';
import FileManager from '@/features/FileManager';
import FilePanel from '@/features/FileSidePanel';
import { useShowMobileWorkspace } from '@/hooks/useShowMobileWorkspace';
import { FilesTabs } from '@/types/files';

import UrlSynchronizer from '../_layout/Desktop/UrlSynchronizer';
import FileMenu from './@menu/features/FileMenu';
import KnowledgeBase from './@menu/features/KnowledgeBase';
import FileModalRoute from './FileModalRoute';
import Container from './_layout/Desktop/Container';
import RegisterHotkeys from './_layout/Desktop/RegisterHotkeys';

const useStyles = createStyles(({ css, token }) => ({
  main: css`
    position: relative;
    overflow: hidden;
    background: ${token.colorBgLayout};
  `,
}));

// Menu content component
const MenuContent = memo(() => {
  const { t } = useTranslation('file');

  return (
    <Flexbox gap={16} height={'100%'}>
      <Flexbox paddingInline={8}>
        <PanelTitle desc={t('desc')} title={t('title')} />
        <FileMenu />
      </Flexbox>
      <KnowledgeBase />
    </Flexbox>
  );
});

MenuContent.displayName = 'MenuContent';

// Main files list component
const FilesListPage = memo(() => {
  const [category] = useFileCategory();

  return <FileManager category={category} title={`${category as FilesTabs}`} />;
});

FilesListPage.displayName = 'FilesListPage';

// Desktop layout
const DesktopLayout = memo(() => {
  return (
    <>
      <NProgress />
      <UrlSynchronizer />
      <Flexbox
        height={'100%'}
        horizontal
        style={{ maxWidth: '100%', overflow: 'hidden', position: 'relative' }}
        width={'100%'}
      >
        <FilePanel>
          <MenuContent />
        </FilePanel>
        <Container>
          <Routes>
            <Route element={<FilesListPage />} path="/" />
            <Route element={<FilesListPage />} path="/:id" />
          </Routes>
        </Container>
      </Flexbox>
      <RegisterHotkeys />
      <Routes>
        <Route element={<FileModalRoute />} path="/:id" />
      </Routes>
    </>
  );
});

DesktopLayout.displayName = 'DesktopLayout';

// Mobile layout
const MobileLayout = memo(() => {
  const showMobileWorkspace = useShowMobileWorkspace();
  const { styles } = useStyles();

  return (
    <>
      <NProgress />
      <UrlSynchronizer />
      <Flexbox
        className={styles.main}
        height="100%"
        style={showMobileWorkspace ? { display: 'none' } : undefined}
        width="100%"
      >
        <MenuContent />
      </Flexbox>
      <Flexbox
        className={styles.main}
        height="100%"
        style={showMobileWorkspace ? undefined : { display: 'none' }}
        width="100%"
      >
        <Routes>
          <Route element={<FilesListPage />} path="/" />
          <Route element={<FilesListPage />} path="/:id" />
        </Routes>
      </Flexbox>
      <Routes>
        <Route element={<FileModalRoute />} path="/:id" />
      </Routes>
    </>
  );
});

MobileLayout.displayName = 'MobileLayout';

// Router content (inside MemoryRouter)
const FilesRouterContent = memo(() => {
  const isMobile = useMediaQuery({ maxWidth: 1024 });

  return isMobile ? <MobileLayout /> : <DesktopLayout />;
});

FilesRouterContent.displayName = 'FilesRouterContent';

// Main Client component with MemoryRouter
const FilesClient = memo(() => {
  return (
    <App style={{ height: '100%' }}>
      <MemoryRouter>
        <FilesRouterContent />
      </MemoryRouter>
    </App>
  );
});

FilesClient.displayName = 'FilesClient';

export default FilesClient;
