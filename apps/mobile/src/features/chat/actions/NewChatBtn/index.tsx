import { MessageSquarePlus } from 'lucide-react-native';
import { useCallback } from 'react';
import { ActionIcon } from '@/components';
import { useSwitchTopic } from '@/hooks/useSwitchSession';
import { ICON_SIZE_LARGE } from '@/const/common';

const NewChatBtn = () => {
  const switchTopic = useSwitchTopic();

  const handleNewChatTopic = useCallback(() => {
    switchTopic();
  }, [switchTopic]);

  return (
    <ActionIcon icon={MessageSquarePlus} onPress={handleNewChatTopic} size={ICON_SIZE_LARGE} />
  );
};

export default NewChatBtn;
