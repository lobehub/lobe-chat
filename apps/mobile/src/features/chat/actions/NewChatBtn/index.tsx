import { ActionIcon, useThemeToken } from '@lobehub/ui-rn';
import { MessageSquarePlus } from 'lucide-react-native';

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
