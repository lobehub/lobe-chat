import { Icon, Tooltip, TooltipProps } from '@lobehub/ui';
import { IconSizeType } from '@lobehub/ui/es/Icon';
import { useTheme } from 'antd-style';
import { CircleHelp } from 'lucide-react';
import { CSSProperties, memo } from 'react';

interface InfoTooltipProps extends Omit<TooltipProps, 'children'> {
  iconStyle?: CSSProperties;
  size?: IconSizeType;
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
