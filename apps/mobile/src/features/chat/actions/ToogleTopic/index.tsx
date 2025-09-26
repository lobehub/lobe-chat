import { ActionIcon, useTheme } from '@lobehub/ui-rn';
import { MessagesSquare } from 'lucide-react-native';

import { useGlobalStore } from '@/store/global';

const ToogleTopicBtn = () => {
  const toggleTopicDrawer = useGlobalStore((s) => s.toggleTopicDrawer);
  const token = useTheme();

  return (
    <ActionIcon
      color={token.colorTextSecondary}
      icon={MessagesSquare}
      onPress={toggleTopicDrawer}
    />
  );
};

export default ToogleTopicBtn;
