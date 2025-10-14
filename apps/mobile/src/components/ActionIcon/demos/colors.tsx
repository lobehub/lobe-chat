import { ActionIcon, Space } from '@lobehub/ui-rn';
import { Flame, Palette, Star } from 'lucide-react-native';

const ColorsDemo = () => {
  return (
    <Space size={[12, 16]} wrap>
      <ActionIcon color="#FF6B6B" icon={Flame} />
      <ActionIcon color="#1C7ED6" icon={Star} />
      <ActionIcon color="#40C057" icon={Palette} />
      <ActionIcon color="#A855F7" icon={Palette} />
    </Space>
  );
};

export default ColorsDemo;
