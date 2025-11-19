import { ActionIcon } from '@lobehub/ui';
import { PlusIcon } from 'lucide-react';
import { memo } from 'react';
import { useNavigate } from 'react-router-dom';

import { useCreateNewModal } from '@/features/KnowledgeBaseModal';

const CreateButton = memo(() => {
  const navigate = useNavigate();
  const { open } = useCreateNewModal();

  const handleCreate = () => {
    open({
      onSuccess: (id) => {
        navigate(`/knowledge/bases/${id}`);
      },
    });
  };

  return <ActionIcon icon={PlusIcon} onClick={handleCreate} size={'small'} />;
});

export default CreateButton;
