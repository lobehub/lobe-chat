import { Dropdown } from '@lobehub/ui';
import { BoxIcon } from 'lucide-react';
import { memo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useKnowledgeBaseStore } from '@/store/knowledgeBase';

import NavItem from '../../../NavItem';
import Actions from './Actions';
import Editing from './Editing';
import { useRepoItemDropdownMenu } from './useDropdownMenu';

interface RepoItemProps {
  expand?: boolean;
  id: string;
  name: string;
}

const RepoItem = memo<RepoItemProps>(({ id, name, expand }) => {
  const navigate = useNavigate();
  const [editing, isLoading, isUpdating] = useKnowledgeBaseStore((s) => [
    s.knowledgeBaseRenamingId === id,
    s.knowledgeBaseLoadingIds.includes(id),
    s.knowledgeBaseUpdatingId === id,
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

  // Fix useEffect dependency array
  useEffect(() => {
    if (!expand && editing) {
      toggleEditing(false);
    }
  }, [expand, editing, toggleEditing]);

  // Memoize click handler
  const handleClick = useCallback(() => {
    navigate(`/knowledge/bases/${id}`);
  }, [id, navigate]);

  const dropdownMenu = useRepoItemDropdownMenu({
    id,
    toggleEditing,
  });

  return (
    <>
      <Dropdown
        menu={{
          items: dropdownMenu,
        }}
        trigger={['contextMenu']}
      >
        <NavItem
          actions={<Actions dropdownMenu={dropdownMenu} />}
          disabled={editing || isUpdating}
          icon={BoxIcon}
          loading={isLoading || isUpdating}
          onClick={handleClick}
          title={name}
        />
      </Dropdown>
      <Editing id={id} name={name} toggleEditing={toggleEditing} />
    </>
  );
});

export default RepoItem;
