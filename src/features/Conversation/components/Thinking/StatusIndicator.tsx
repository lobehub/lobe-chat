import { Block, Icon } from '@lobehub/ui';
import { useTheme } from 'antd-style';
import { AtomIcon, Loader2Icon } from 'lucide-react';
import { memo } from 'react';

interface StatusIndicatorProps {
  showDetail?: boolean;
  thinking?: boolean;
}

const StatusIndicator = memo<StatusIndicatorProps>(({ thinking, showDetail }) => {
  const theme = useTheme();
  let icon;

  if (thinking) {
    icon = <Icon color={theme.colorTextDescription} icon={Loader2Icon} spin />;
  } else {
    icon = <Icon color={showDetail ? theme.purple : theme.colorTextDescription} icon={AtomIcon} />;
  }

  return (
    <Block
      align={'center'}
      flex={'none'}
      gap={4}
      height={24}
      horizontal
      justify={'center'}
      style={{
        fontSize: 12,
      }}
      variant={'outlined'}
      width={24}
    >
      {icon}
    </Block>
  );
});

export default StatusIndicator;
