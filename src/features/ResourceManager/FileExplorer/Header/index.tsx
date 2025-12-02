'use client';

import { useTheme } from 'antd-style';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import NavHeader from '@/features/NavHeader';

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
    return (
      <NavHeader
        left={
          <Flexbox style={{ marginLeft: 8 }}>
            <Breadcrumb category={category} knowledgeBaseId={knowledgeBaseId} />
          </Flexbox>
        }
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
