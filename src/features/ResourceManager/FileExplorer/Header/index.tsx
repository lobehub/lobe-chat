'use client';

import { useTheme } from 'antd-style';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import NavHeader from '@/features/NavHeader';
import { FilesTabs } from '@/types/files';

import AddButton from '../../Header/AddButton';
import BatchActionsDropdown from '../ToolBar/BatchActionsDropdown';
import ExpandableSearch from '../ToolBar/ExpandableSearch';
import type { MultiSelectActionType } from '../ToolBar/MultiSelectActions';
import SortDropdown from '../ToolBar/SortDropdown';
import ViewSwitcher, { ViewMode } from '../ToolBar/ViewSwitcher';
import Breadcrumb from './Breadcrumb';

interface HeaderProps {
  category?: string;
  knowledgeBaseId?: string;
  onActionClick: (type: MultiSelectActionType) => Promise<void>;
  onViewChange: (mode: ViewMode) => void;
  selectCount: number;
  viewMode: ViewMode;
}

const Header = memo<HeaderProps>(
  ({ category, knowledgeBaseId, onActionClick, onViewChange, selectCount, viewMode }) => {
    const theme = useTheme();
    const { t } = useTranslation('file');

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
              selectCount={selectCount}
            />
            <ViewSwitcher onViewChange={onViewChange} view={viewMode} />
            <Flexbox style={{ marginLeft: 8 }}>
              <AddButton knowledgeBaseId={knowledgeBaseId} />
            </Flexbox>
          </>
        }
        style={{
          borderBottom: `1px solid ${theme.colorBorderSecondary}`,
        }}
      />
    );
  },
);

export default Header;
