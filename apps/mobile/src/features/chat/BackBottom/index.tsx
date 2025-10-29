import { Button, useTheme } from '@lobehub/ui-rn';
import { ArrowDown } from 'lucide-react-native';
import { memo } from 'react';

interface ScrollToBottomProps {
  onScrollToBottom: () => void;
  visible: boolean;
}

const ScrollToBottom = memo<ScrollToBottomProps>(({ onScrollToBottom, visible }) => {
  const theme = useTheme();

  if (!visible) return null;

  return (
    <Button
      glass
      icon={ArrowDown}
      iconProps={{
        color: theme.colorTextSecondary,
        size: 16,
      }}
      onPress={onScrollToBottom}
      shape={'circle'}
      size={'small'}
      style={{
        bottom: 12,
        position: 'absolute',
        right: 24,
      }}
      variant={'outlined'}
    />
  );
});

export default memo(ScrollToBottom);
