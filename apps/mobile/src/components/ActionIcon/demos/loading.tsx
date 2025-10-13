import { ActionIcon, Space } from '@lobehub/ui-rn';
import { RefreshCw } from 'lucide-react-native';

const LoadingDemo = () => {
  return (
    <Space size={[12, 16]} wrap>
      <ActionIcon icon={RefreshCw} loading />
      <ActionIcon icon={RefreshCw} loading variant="filled" />
      <ActionIcon icon={RefreshCw} loading variant="outlined" />
    </Space>
  );
};

export default LoadingDemo;
