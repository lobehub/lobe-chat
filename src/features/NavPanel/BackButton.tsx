import { ActionIcon } from '@lobehub/ui';
import { MenuIcon } from 'lucide-react';
import { memo } from 'react';
import { useNavigate } from 'react-router-dom';

const BackButton = memo(() => {
  const navigate = useNavigate();
  return <ActionIcon icon={MenuIcon} onClick={() => navigate('/')} />;
});

export default BackButton;
