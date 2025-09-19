import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { TouchableOpacity } from 'react-native';

import Icon from '@/components/Icon';

const NavigateBack = () => {
  const router = useRouter();

  return (
    <TouchableOpacity onPress={() => router.back()}>
      <Icon icon={ChevronLeft} />
    </TouchableOpacity>
  );
};

export default NavigateBack;
