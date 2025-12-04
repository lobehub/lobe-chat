import { Icon, type MenuProps } from '@lobehub/ui';
import { Dropdown } from '@lobehub/ui';
import { useTheme } from 'antd-style';
import { Loader2Icon } from 'lucide-react';
import React, { CSSProperties, memo, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import RepoIcon from '@/components/LibIcon';
import NavItem from '@/features/NavPanel/components/NavItem';
import { useKnowledgeBaseStore } from '@/store/knowledgeBase';

import Actions from './Actions';
import Editing from './Editing';
import { useDropdownMenu } from './useDropdownMenu';

interface KnowledgeBaseItemProps {
  active?: boolean;
  className?: string;
  id: string;
  name: string;
  style?: CSSProperties;
}

const KnowledgeBaseItem = memo<KnowledgeBaseItemProps>(({ id, name, active, style, className }) => {
  const theme = useTheme();
  const navigate = useNavigate();

  const [editing, isLoading] = useKnowledgeBaseStore((s) => [
    s.knowledgeBaseRenamingId === id,
    s.knowledgeBaseLoadingIds.includes(id),
  ]);

  const toggleEditing = useCallback(
    (visible?: boolean) => {
      useKnowledgeBaseStore.setState(
        { knowledgeBaseRenamingId: visible ? id : null },
        false,
        'toggleEditing',
      );
    },
    [id],
  );

  const handleClick = useCallback(() => {
    if (!editing) {
      navigate(`/resource/library/${id}`);
    }
  }, [editing, navigate, id]);

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.altKey) {
        toggleEditing(true);
      }
    },
    [toggleEditing],
  );

  // Icon (show loader when updating)
  const icon = useMemo(() => {
    if (isLoading) {
      return <Icon color={theme.colorTextDescription} icon={Loader2Icon} size={18} spin />;
    }
    return <RepoIcon size={18} />;
  }, [isLoading, theme.colorTextDescription]);

  const dropdownMenu: MenuProps['items'] = useDropdownMenu({
    id,
    toggleEditing,
  });

  return (
    <Dropdown
      menu={{
        items: dropdownMenu,
      }}
      trigger={['contextMenu']}
    >
      <NavItem
        actions={<Actions dropdownMenu={dropdownMenu} />}
        active={active}
        className={className}
        disabled={editing}
        icon={icon}
        key={id}
        loading={isLoading}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        style={style}
        title={editing ? <Editing id={id} name={name} toggleEditing={toggleEditing} /> : name}
      />
    </Dropdown>
  );
});

export default KnowledgeBaseItem;
