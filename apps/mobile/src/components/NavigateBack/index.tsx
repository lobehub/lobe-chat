import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { TouchableOpacity } from 'react-native';

import { ICON_SIZE } from '@/const/common';
import { useThemeToken } from '@/theme';

const NavigateBack = () => {
  const router = useRouter();
  const token = useThemeToken();

  return (
    <TouchableOpacity onPress={() => router.back()}>
      <ChevronLeft color={token.colorText} size={ICON_SIZE} />
    </TouchableOpacity>
  );
};

export default NavigateBack;
