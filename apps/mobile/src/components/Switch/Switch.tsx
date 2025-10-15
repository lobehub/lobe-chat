import { memo, useCallback, useMemo, useState } from 'react';
import { LayoutChangeEvent, Platform, Switch as RNSwitch } from 'react-native';
import useMergeState from 'use-merge-value';

import { cva, useTheme } from '@/components/styles';

import Flexbox from '../Flexbox';
import type { SwitchProps } from './type';

const Switch = memo<SwitchProps>(
  ({
    defaultChecked = false,
    checked,
    onChange,
    thumbColor,
    trackColor,
    size = 'default',
    style,
    ...rest
  }) => {
    const [value, setValue] = useMergeState(defaultChecked, {
      defaultValue: defaultChecked,
      onChange: async (newValue) => onChange?.(newValue),
      value: checked,
    });

    const token = useTheme();

    const finalThumbColor = thumbColor ?? token.colorTextLightSolid;
    const finalTrackColor =
      trackColor ??
      ({
        false: token.colorFillTertiary,
        true: token.colorSuccess,
      } as NonNullable<SwitchProps['trackColor']>);

    const variants = useMemo(
      () =>
        cva([], {
          defaultVariants: {
            size: 'default',
          },
          variants: {
            size: {
              default: Platform.select({
                android: {},
                ios: {
                  transform: [{ scale: 0.8 }],
                },
              }),
              large: Platform.select({
                android: {
                  transform: [{ scale: 1.2 }],
                },
                ios: {},
              }),
              small: Platform.select({
                android: {
                  transform: [{ scale: 0.8 }],
                },
                ios: {
                  transform: [{ scale: 0.6 }],
                },
              }),
            },
          },
        }),
      [],
    );

    // Numeric scale for computing container size to match visual size after transform
    const numericScale = useMemo(() => {
      switch (size) {
        case 'large': {
          return Platform.OS === 'ios' ? 1 : 1.2;
        }
        case 'small': {
          return Platform.OS === 'ios' ? 0.6 : 0.8;
        }
        default: {
          return Platform.OS === 'ios' ? 0.8 : 1;
        }
      }
    }, [size]);

    const [intrinsicWidth, setIntrinsicWidth] = useState<number | undefined>(undefined);
    const [intrinsicHeight, setIntrinsicHeight] = useState<number | undefined>(undefined);

    const handleLayout = useCallback((e: LayoutChangeEvent) => {
      const { width, height } = e.nativeEvent.layout;
      if (width && height) {
        // Capture intrinsic (unscaled) dimensions once
        setIntrinsicWidth((prev) => (prev === undefined ? width : prev));
        setIntrinsicHeight((prev) => (prev === undefined ? height : prev));
      }
    }, []);

    const containerWidth = intrinsicWidth ? intrinsicWidth * numericScale : undefined;
    const containerHeight = intrinsicHeight ? intrinsicHeight * numericScale : undefined;

    return (
      <Flexbox
        align="center"
        height={containerHeight}
        justify="center"
        style={style}
        width={containerWidth}
      >
        <RNSwitch
          ios_backgroundColor={finalTrackColor.false || token.colorFillTertiary}
          onLayout={handleLayout}
          onValueChange={setValue}
          style={[{ transformOrigin: 'left' }, variants({ size })]}
          thumbColor={finalThumbColor}
          trackColor={finalTrackColor}
          value={value}
          {...rest}
        />
      </Flexbox>
    );
  },
);

Switch.displayName = 'Switch';

export default Switch;
