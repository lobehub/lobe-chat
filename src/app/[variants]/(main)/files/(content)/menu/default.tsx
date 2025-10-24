'use client';

import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import PanelTitle from '@/components/PanelTitle';

import FileMenu from './features/FileMenu';
import KnowledgeBase from './features/KnowledgeBase';

const Menu = () => {
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
};

Menu.displayName = 'Menu';

export default Menu;
