import { Block, Icon } from '@lobehub/ui-rn';
import { ArrowDown } from 'lucide-react-native';
import { memo } from 'react';
import { View } from 'react-native';

import { useStyles } from './style';

interface ScrollToBottomProps {
  onScrollToBottom: () => void;
  visible: boolean;
}

const ScrollToBottom = ({ onScrollToBottom, visible }: ScrollToBottomProps) => {
  const { styles, theme } = useStyles();

  if (!visible) return null;

  return (
    <View pointerEvents="box-none" style={styles.scrollToBottomWrapper}>
      <Block
        borderRadius={40}
        clickable
        onPress={onScrollToBottom}
        padding={10}
        shadow
        variant={'outlined'}
      >
        <Icon color={theme.colorTextSecondary} icon={ArrowDown} size={20} />
      </Block>
    </View>
  );
};

export default memo(ScrollToBottom);
