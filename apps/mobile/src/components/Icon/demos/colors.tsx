import { Flexbox, Icon } from '@lobehub/ui-rn';
import { Flame, Palette, Sparkles } from 'lucide-react-native';

const ColorsDemo = () => {
  return (
    <Flexbox gap={16} horizontal>
      <Icon color="#FF6B6B" icon={Flame} />
      <Icon color="#1C7ED6" icon={Palette} />
      <Icon color="#40C057" icon={Sparkles} />
    </Flexbox>
  );
};

export default ColorsDemo;
