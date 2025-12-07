'use client';

import { useTheme } from 'antd-style';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useResourceManagerStore } from '@/app/[variants]/(main)/resource/features/store';
import NavHeader from '@/features/NavHeader';
import { FilesTabs } from '@/types/files';

import AddButton from '../../Header/AddButton';
import BatchActionsDropdown from '../ToolBar/BatchActionsDropdown';
import ExpandableSearch from '../ToolBar/ExpandableSearch';
import SortDropdown from '../ToolBar/SortDropdown';
import ViewSwitcher from '../ToolBar/ViewSwitcher';
import { useFileExplorer } from '../useFileExplorer';
import Breadcrumb from './Breadcrumb';

const Header = memo(() => {
  const theme = useTheme();
  const { t } = useTranslation('file');

  const libraryId = useResourceManagerStore((s) => s.libraryId);

  const { category, knowledgeBaseId, onActionClick, selectFileIds, setViewMode, viewMode } =
    useFileExplorer({ libraryId });

  // If no knowledgeBaseId, show just the category name
  const leftContent =
    !knowledgeBaseId && category && category !== FilesTabs.All ? (
      <Flexbox style={{ marginLeft: 8 }}>{t(`tab.${category as FilesTabs}` as any)}</Flexbox>
    ) : (
      <Flexbox style={{ marginLeft: 8 }}>
        <Breadcrumb category={category} knowledgeBaseId={knowledgeBaseId} />
      </Flexbox>
    );

  return (
    <NavHeader
      left={leftContent}
      right={
        <>
          <ExpandableSearch />
          <SortDropdown />
          <BatchActionsDropdown
            isInKnowledgeBase={!!knowledgeBaseId}
            knowledgeBaseId={knowledgeBaseId}
            onActionClick={onActionClick}
            selectCount={selectFileIds.length}
          />
          <ViewSwitcher onViewChange={setViewMode} view={viewMode} />
          <Flexbox style={{ marginLeft: 8 }}>
            <AddButton />
          </Flexbox>
        </>
      }
      style={{
        borderBottom: `1px solid ${theme.colorBorderSecondary}`,
      }}
    />
  );
});

export default Header;
