import React, { memo, useCallback, useMemo } from 'react';
import { View, ViewStyle, LayoutRectangle } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  runOnJS,
  Extrapolation,
} from 'react-native-reanimated';

import { useStyles } from './style';

export interface SliderProps {
  accessibilityHint?: string;
  // Accessibility
  accessibilityLabel?: string;
  defaultValue?: number;
  disabled?: boolean;
  max?: number;
  min?: number;
  onChange?: (value: number) => void;
  onChangeComplete?: (value: number) => void;
  step?: number;
  style?: ViewStyle;
  thumbStyle?: ViewStyle;
  trackStyle?: ViewStyle;
  value?: number;
}

const Slider = memo<SliderProps>(
  ({
    disabled = false,
    max = 100,
    min = 0,
    onChange,
    onChangeComplete,
    step = 1,
    style,
    trackStyle,
    thumbStyle,
    value,
    defaultValue = min,
    accessibilityLabel,
    accessibilityHint,
  }) => {
    const { styles } = useStyles({ disabled });

    const currentValue = value ?? defaultValue;
    const sliderWidth = useSharedValue(0);
    const translateX = useSharedValue(0);
    const isDragging = useSharedValue(false);

    // Calculate thumb position based on current value (worklet function)
    const getThumbPosition = useCallback(
      (val: number, width: number) => {
        'worklet';
        const percentage = (val - min) / (max - min);
        return interpolate(percentage, [0, 1], [0, width], Extrapolation.CLAMP);
      },
      [min, max],
    );

    // Convert position to value (worklet function)
    const getValueFromPosition = useCallback(
      (position: number, width: number) => {
        'worklet';
        const percentage = position / width;
        const rawValue = min + percentage * (max - min);
        const steppedValue = Math.round(rawValue / step) * step;
        return Math.max(min, Math.min(max, steppedValue));
      },
      [min, max, step],
    );

    // Initialize thumb position
    React.useEffect(() => {
      if (sliderWidth.value > 0) {
        translateX.value = getThumbPosition(currentValue, sliderWidth.value);
      }
    }, [currentValue, getThumbPosition, sliderWidth.value, translateX]);

    const handleValueChange = useCallback(
      (newValue: number) => {
        onChange?.(newValue);
      },
      [onChange],
    );

    const handleValueChangeComplete = useCallback(
      (newValue: number) => {
        onChangeComplete?.(newValue);
      },
      [onChangeComplete],
    );

    const startX = useSharedValue(0);

    const panGesture = Gesture.Pan()
      .enabled(!disabled)
      .onStart(() => {
        isDragging.value = true;
        startX.value = translateX.value;
      })
      .onUpdate((event) => {
        const newPosition = Math.max(
          0,
          Math.min(sliderWidth.value, startX.value + event.translationX),
        );
        translateX.value = newPosition;

        const newValue = getValueFromPosition(newPosition, sliderWidth.value);
        runOnJS(handleValueChange)(newValue);
      })
      .onEnd(() => {
        isDragging.value = false;
        const newValue = getValueFromPosition(translateX.value, sliderWidth.value);
        runOnJS(handleValueChangeComplete)(newValue);
      });

    const thumbAnimatedStyle = useAnimatedStyle(() => {
      return {
        transform: [{ translateX: translateX.value }],
      };
    });

    const activeTrackAnimatedStyle = useAnimatedStyle(() => {
      return {
        width: translateX.value,
      };
    });

    const onLayout = useCallback(
      (event: { nativeEvent: { layout: LayoutRectangle } }) => {
        const { width } = event.nativeEvent.layout;
        sliderWidth.value = width;
        translateX.value = getThumbPosition(currentValue, width);
      },
      [currentValue, getThumbPosition, sliderWidth, translateX],
    );

    const trackStyles = useMemo(() => [styles.track, trackStyle], [styles.track, trackStyle]);
    const thumbStyles = useMemo(() => [styles.thumb, thumbStyle], [styles.thumb, thumbStyle]);

    return (
      <View
        accessibilityHint={
          accessibilityHint ||
          `Adjustable slider from ${min} to ${max}, current value is ${currentValue}`
        }
        accessibilityLabel={accessibilityLabel || `Slider, value ${currentValue}`}
        accessibilityRole="adjustable"
        accessibilityValue={{
          max,
          min,
          now: currentValue,
        }}
        accessible
        style={[styles.container, style]}
      >
        <View onLayout={onLayout} style={trackStyles}>
          <Animated.View style={[styles.activeTrack, activeTrackAnimatedStyle]} />
          <GestureDetector gesture={panGesture}>
            <Animated.View accessible={false} style={[thumbStyles, thumbAnimatedStyle]} />
          </GestureDetector>
        </View>
      </View>
    );
  },
);

export default Slider;
