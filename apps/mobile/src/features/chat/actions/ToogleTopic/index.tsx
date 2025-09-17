import { Icon, useThemeToken } from '@/components';
import { MessagesSquare } from 'lucide-react-native';
import { useGlobalStore } from '@/store/global';
import { Pressable } from 'react-native';

const ToogleTopicBtn = () => {
  const toggleTopicDrawer = useGlobalStore((s) => s.toggleTopicDrawer);
  const token = useThemeToken();

  return (
    <Pressable onPress={toggleTopicDrawer}>
      <Icon color={token.colorTextSecondary} icon={MessagesSquare} />
    </Pressable>
  );
};

export default ToogleTopicBtn;
