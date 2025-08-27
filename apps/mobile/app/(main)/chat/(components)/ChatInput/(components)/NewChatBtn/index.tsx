import { MessageSquarePlus } from 'lucide-react-native';
import { useThemeToken } from '@/theme';
import { useCallback } from 'react';
import { ICON_SIZE } from '@/const/common';
import IconBtn from '../IconBtn';
import { useSwitchTopic } from '@/hooks/useSwitchSession';

const NewChatBtn = () => {
  const token = useThemeToken();
  const switchTopic = useSwitchTopic();

  const handleNewChatTopic = useCallback(() => {
    switchTopic();
  }, [switchTopic]);

  return (
    <IconBtn
      icon={<MessageSquarePlus color={token.colorText} size={ICON_SIZE} />}
      onPress={handleNewChatTopic}
    />
  );
};

export default NewChatBtn;
