import { ActionIcon, Space } from '@lobehub/ui-rn';
import { Flame, Palette, Star } from 'lucide-react-native';

const ColorsDemo = () => {
  return (
    <Space size={[12, 16]} wrap>
      <ActionIcon color="#FF6B6B" icon={Flame} variant="borderless" />
      <ActionIcon color="#1C7ED6" icon={Star} variant="filled" />
      <ActionIcon color="#40C057" icon={Palette} variant="outlined" />
      <ActionIcon color="#A855F7" icon={Palette} size="large" />
    </Space>
  );
};

export default ColorsDemo;
