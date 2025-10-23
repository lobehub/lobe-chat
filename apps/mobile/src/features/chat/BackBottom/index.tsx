import { Button } from '@lobehub/ui-rn';
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
      <Button
        glass
        icon={ArrowDown}
        iconProps={{
          color: theme.colorTextSecondary,
          size: 20,
        }}
        onPress={onScrollToBottom}
        shape={'circle'}
        variant={'outlined'}
      />
    </View>
  );
};

export default memo(ScrollToBottom);
