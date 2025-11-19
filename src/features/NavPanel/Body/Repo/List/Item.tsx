import { BoxIcon } from 'lucide-react';
import { memo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';
import { useKnowledgeBaseStore } from '@/store/knowledgeBase';

import NavItem from '../../../NavItem';
import Actions from './Actions';
import Editing from './Editing';

export const knowledgeItemClass = 'knowledge-base-item';

interface RepoItemProps {
  id: string;
  name: string;
}

const RepoItem = memo<RepoItemProps>(({ id, name }) => {
  const expand = useGlobalStore(systemStatusSelectors.showSessionPanel);
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

  return (
    <>
      <NavItem
        actions={<Actions id={id} toggleEditing={toggleEditing} />}
        disabled={editing}
        icon={BoxIcon}
        loading={isLoading}
        onClick={handleClick}
        title={name}
      />
      <Editing id={id} name={name} toggleEditing={toggleEditing} />
    </>
  );
});

export default RepoItem;
