import { MessageSquarePlus } from 'lucide-react-native';

import { ActionIcon, useThemeToken } from '@/components';
import { useSwitchTopic } from '@/hooks/useSwitchSession';

const NewChatBtn = () => {
  const switchTopic = useSwitchTopic();
  const token = useThemeToken();

  return (
    <ActionIcon
      color={token.colorTextSecondary}
      icon={MessageSquarePlus}
      onPress={() => switchTopic()}
    />
  );
};

export default NewChatBtn;
