import { MessageSquarePlus } from 'lucide-react-native';
import { useCallback } from 'react';
import { Icon, useThemeToken } from '@/components';
import { useSwitchTopic } from '@/hooks/useSwitchSession';
import { Pressable } from 'react-native';

const NewChatBtn = () => {
  const switchTopic = useSwitchTopic();
  const token = useThemeToken();

  const handleNewChatTopic = useCallback(() => {
    switchTopic();
  }, [switchTopic]);

  return (
    <Pressable onPress={handleNewChatTopic}>
      <Icon color={token.colorTextSecondary} icon={MessageSquarePlus} />
    </Pressable>
  );
};

export default NewChatBtn;
