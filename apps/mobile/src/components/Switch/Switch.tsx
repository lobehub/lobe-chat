import { memo } from 'react';
import { Switch as RNSwitch } from 'react-native';

import { useTheme } from '@/components/styles';

import type { SwitchProps } from './type';

const Switch = memo<SwitchProps>(({ thumbColor, trackColor, ...rest }) => {
  const token = useTheme();

  const finalThumbColor = thumbColor ?? token.colorTextLightSolid;
  const finalTrackColor =
    trackColor ??
    ({
      false: token.colorBgContainerDisabled,
      true: token.colorPrimary,
    } as NonNullable<SwitchProps['trackColor']>);

  return <RNSwitch thumbColor={finalThumbColor} trackColor={finalTrackColor} {...rest} />;
});

Switch.displayName = 'Switch';

export default Switch;
