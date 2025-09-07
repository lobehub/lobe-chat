import { ArrowDown } from 'lucide-react-native';
import { TouchableOpacity, View } from 'react-native';

import { ICON_SIZE } from '@/const/common';
import { useStyles } from './style';

interface ScrollToBottomProps {
  onScrollToBottom: () => void;
  visible: boolean;
}

export default function ScrollToBottom({ onScrollToBottom, visible }: ScrollToBottomProps) {
  const { styles, token } = useStyles();

  if (!visible) return null;

  return (
    <View pointerEvents="box-none" style={styles.scrollToBottomWrapper}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={onScrollToBottom}
        style={styles.scrollToBottomBtn}
      >
        <ArrowDown color={token.colorText} size={ICON_SIZE} />
      </TouchableOpacity>
    </View>
  );
}
