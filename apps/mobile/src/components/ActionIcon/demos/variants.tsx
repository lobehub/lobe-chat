import { ActionIcon, Space } from '@lobehub/ui-rn';
import { MoonStar, Sun } from 'lucide-react-native';

const VariantsDemo = () => {
  return (
    <Space size={[12, 16]} wrap>
      <ActionIcon icon={Sun} variant="borderless" />
      <ActionIcon icon={Sun} variant="filled" />
      <ActionIcon icon={MoonStar} variant="outlined" />
    </Space>
  );
};

export default VariantsDemo;
