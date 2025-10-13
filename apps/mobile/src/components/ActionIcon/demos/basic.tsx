import { ActionIcon, Space } from '@lobehub/ui-rn';
import { Heart, MessageSquare, Settings2 } from 'lucide-react-native';

const BasicDemo = () => {
  return (
    <Space size={[12, 16]} wrap>
      <ActionIcon icon={Heart} />
      <ActionIcon icon={MessageSquare} />
      <ActionIcon icon={Settings2} />
    </Space>
  );
};

export default BasicDemo;
