import { ActionIcon } from '@/components';
import { MessagesSquare } from 'lucide-react-native';
import { useGlobalStore } from '@/store/global';

const ToogleTopicBtn = () => {
  const toggleTopicDrawer = useGlobalStore((s) => s.toggleTopicDrawer);

  return <ActionIcon icon={MessagesSquare} onPress={toggleTopicDrawer} />;
};

export default ToogleTopicBtn;
