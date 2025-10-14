import { Flexbox, Icon } from '@lobehub/ui-rn';
import { Heart, MessageCircle, Star } from 'lucide-react-native';

const BasicDemo = () => {
  return (
    <Flexbox gap={16} horizontal>
      <Icon icon={Heart} />
      <Icon icon={MessageCircle} />
      <Icon icon={Star} />
    </Flexbox>
  );
};

export default BasicDemo;
