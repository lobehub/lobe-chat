import { Icon } from '@lobehub/ui-rn';
import { ArrowDown } from 'lucide-react-native';
import React, { memo } from 'react';
import { TouchableOpacity, View } from 'react-native';

import { useStyles } from './style';

interface ScrollToBottomProps {
  onScrollToBottom: () => void;
  visible: boolean;
}

const ScrollToBottom = ({ onScrollToBottom, visible }: ScrollToBottomProps) => {
  const { styles } = useStyles();

  if (!visible) return null;

  return (
    <View pointerEvents="box-none" style={styles.scrollToBottomWrapper}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={onScrollToBottom}
        style={styles.scrollToBottomBtn}
      >
        <Icon icon={ArrowDown} />
      </TouchableOpacity>
    </View>
  );
};

export default memo(ScrollToBottom);
