import { ActionIcon, useThemeToken } from '@lobehub/ui-rn';
import { MessagesSquare } from 'lucide-react-native';

import { useGlobalStore } from '@/store/global';

const ToogleTopicBtn = () => {
  const toggleTopicDrawer = useGlobalStore((s) => s.toggleTopicDrawer);
  const token = useThemeToken();

  return (
    <ActionIcon
      color={token.colorTextSecondary}
      icon={MessagesSquare}
      onPress={toggleTopicDrawer}
    />
  );
};

export default ToogleTopicBtn;
