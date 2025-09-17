import { MessageSquarePlus } from 'lucide-react-native';
import { useCallback } from 'react';
import { ActionIcon, useThemeToken } from '@/components';
import { useSwitchTopic } from '@/hooks/useSwitchSession';

const NewChatBtn = () => {
  const switchTopic = useSwitchTopic();
  const token = useThemeToken();

  const handleNewChatTopic = useCallback(() => {
    switchTopic();
  }, [switchTopic]);

  return (
    <ActionIcon
      color={token.colorTextSecondary}
      icon={MessageSquarePlus}
      onPress={handleNewChatTopic}
    />
  );
};

export default NewChatBtn;
