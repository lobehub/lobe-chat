import { Flexbox, Icon } from '@lobehub/ui-rn';
import { LoaderCircle, RefreshCw, RotateCcw } from 'lucide-react-native';

const SpinDemo = () => {
  return (
    <Flexbox gap={16} horizontal>
      <Icon icon={LoaderCircle} spin />
      <Icon color="#1C7ED6" icon={RefreshCw} size={28} spin />
      <Icon color="#F59F00" icon={RotateCcw} size={32} spin />
    </Flexbox>
  );
};

export default SpinDemo;
