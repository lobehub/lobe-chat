import { Block, Icon } from '@lobehub/ui';
import { cssVar, useTheme } from 'antd-style';
import { AtomIcon, Loader2Icon } from 'lucide-react';
import { memo } from 'react';

interface StatusIndicatorProps {
  showDetail?: boolean;
  thinking?: boolean;
}

const StatusIndicator = memo<StatusIndicatorProps>(({ thinking, showDetail }) => {
  const theme = useTheme(); // Keep for dynamic color (purple)
  let icon;

  if (thinking) {
    icon = <Icon color={cssVar.colorTextDescription} icon={Loader2Icon} spin />;
  } else {
    icon = <Icon color={showDetail ? theme.purple : cssVar.colorTextDescription} icon={AtomIcon} />;
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
