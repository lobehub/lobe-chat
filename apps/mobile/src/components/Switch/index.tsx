import type { FC } from 'react';
import { memo } from 'react';
import { Switch as RNSwitch, SwitchProps } from 'react-native';

import { useTheme } from '@/components/theme';

export type ThemedSwitchProps = SwitchProps;

const ThemedSwitch: FC<ThemedSwitchProps> = ({ thumbColor, trackColor, ...rest }) => {
  const token = useTheme();

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
