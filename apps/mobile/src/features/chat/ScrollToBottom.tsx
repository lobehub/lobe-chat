import { ArrowDown } from 'lucide-react-native';
import { TouchableOpacity, View } from 'react-native';

import { ICON_SIZE } from '@/const/common';
import { createStyles } from '@/theme';

interface ScrollToBottomProps {
  onPress: () => void;
  visible: boolean;
}

const useStyles = createStyles((token) => ({
  scrollToBottomBtn: {
    backgroundColor: token.colorBgContainer,
    borderRadius: token.borderRadiusLG * 3,
    padding: token.paddingXS,
    ...token.boxShadow,
  },
  scrollToBottomWrapper: {
    alignItems: 'center',
    bottom: 8,
    left: 0,
    pointerEvents: 'box-none',
    position: 'absolute',
    right: 0,
    zIndex: 10,
  },
}));

export default function ScrollToBottom({ onPress, visible }: ScrollToBottomProps) {
  const { styles, token } = useStyles();

  if (!visible) return null;

  return (
    <View pointerEvents="box-none" style={styles.scrollToBottomWrapper}>
      <TouchableOpacity activeOpacity={0.7} onPress={onPress} style={styles.scrollToBottomBtn}>
        <ArrowDown color={token.colorText} size={ICON_SIZE} />
      </TouchableOpacity>
    </View>
  );
}
