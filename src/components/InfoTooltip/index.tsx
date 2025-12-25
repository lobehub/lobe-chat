import { Icon, type IconSize, Tooltip, TooltipProps } from '@lobehub/ui';
import { useTheme } from 'antd-style';
import { CircleHelp } from 'lucide-react';
import { CSSProperties, memo } from 'react';

interface InfoTooltipProps extends Omit<TooltipProps, 'children'> {
  iconStyle?: CSSProperties;
  size?: IconSize;
}

const InfoTooltip = memo<InfoTooltipProps>(({ size, iconStyle, ...res }) => {
  const theme = useTheme();
  return (
    <Tooltip {...res}>
      <Icon
        icon={CircleHelp}
        size={size}
        style={{ color: theme.colorTextTertiary, ...iconStyle }}
      />
    </Tooltip>
  );
});

export default InfoTooltip;
