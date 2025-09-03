import React, { memo } from 'react';
import { Switch as RNSwitch, SwitchProps } from 'react-native';

import { useThemeToken } from '@/theme';

export type ThemedSwitchProps = SwitchProps;

const ThemedSwitch: React.FC<ThemedSwitchProps> = ({ thumbColor, trackColor, ...rest }) => {
  const token = useThemeToken();

  const finalThumbColor = thumbColor ?? token.colorTextLightSolid;
  const finalTrackColor =
    trackColor ??
    ({
      false: token.colorBgContainerDisabled,
      true: token.colorPrimary,
    } as NonNullable<SwitchProps['trackColor']>);

  return <RNSwitch thumbColor={finalThumbColor} trackColor={finalTrackColor} {...rest} />;
};

export default memo(ThemedSwitch);
