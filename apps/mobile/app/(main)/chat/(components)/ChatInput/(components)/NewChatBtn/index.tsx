import { MessageSquarePlus } from 'lucide-react-native';
import { useThemeToken } from '@/theme';
import { useCallback } from 'react';
import { ICON_SIZE } from '@/const/common';
import IconBtn from '../IconBtn';
import { useChat } from '@/hooks/useChat';
import { useSessionStore } from '@/store/session';

const NewChatBtn = () => {
  const token = useThemeToken();
  const { activeId } = useSessionStore();

  const { clearMessages } = useChat();

  const handleClearMessages = useCallback(() => {
    clearMessages(activeId);
  }, [activeId, clearMessages]);

  return (
    <IconBtn
      icon={<MessageSquarePlus color={token.colorText} size={ICON_SIZE} />}
      onPress={handleClearMessages}
    />
  );
};

export default NewChatBtn;
