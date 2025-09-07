import React, { memo, useCallback, useMemo, useState } from 'react';
import { View, ViewStyle, LayoutRectangle, Text } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  runOnJS,
  Extrapolation,
} from 'react-native-reanimated';

import { DOT_SIZE, useStyles } from './style';

export interface SliderProps {
  defaultValue?: number;
  disabled?: boolean;
  marks?: Record<
    number,
    | React.ReactNode
    | {
        label: React.ReactNode;
        style?: ViewStyle;
      }
  >;
  max?: number;
  min?: number;
  onChange?: (value: number) => void;
  onChangeComplete?: (value: number) => void;
  step?: number | null;
  style?: ViewStyle;
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
    value,
    defaultValue = min,
    marks,
  }) => {
    const { styles } = useStyles({ disabled });

    const currentValue = value ?? defaultValue;
    const sliderWidth = useSharedValue(0);
    const translateX = useSharedValue(0);
    const isDragging = useSharedValue(false);
    const lastEmittedActiveValue = useSharedValue<number>(currentValue);
    const [isThumbActive, setIsThumbActive] = useState(false);

    const [layoutWidth, setLayoutWidth] = useState(0);
    const [labelWidths, setLabelWidths] = useState<Record<number, number>>({});
    const [activeValueJS, setActiveValueJS] = useState<number>(currentValue);

    const markValues = useMemo(() => {
      if (!marks) return [] as number[];
      const entries = Object.keys(marks)
        .map(Number)
        .filter((n) => Number.isFinite(n) && n >= min && n <= max);
      entries.sort((a, b) => a - b);
      return entries;
    }, [marks, min, max]);

    const marksOnlyMode = useMemo(
      () => step === null && markValues.length > 0,
      [step, markValues.length],
    );

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
        const percentage = width > 0 ? position / width : 0;
        const rawValue = min + percentage * (max - min);

        if (marksOnlyMode) {
          if (markValues.length === 0) return Math.max(min, Math.min(max, rawValue));
          let nearest = markValues[0];
          let minDiff = Math.abs(rawValue - nearest);
          for (let i = 1; i < markValues.length; i++) {
            const v = markValues[i];
            const diff = Math.abs(rawValue - v);
            if (diff < minDiff) {
              minDiff = diff;
              nearest = v;
            }
          }
          return nearest;
        }

        const effectiveStep = !step || step <= 0 ? 1 : step;
        const steppedValue = Math.round(rawValue / effectiveStep) * effectiveStep;
        return Math.max(min, Math.min(max, steppedValue));
      },
      [min, max, step, marksOnlyMode, markValues],
    );

    // Initialize thumb position
    React.useEffect(() => {
      if (
        sliderWidth.value > 0 && // 受控模式下：拖动过程中不强制同步 translateX，避免视觉抖动
        !isThumbActive
      ) {
        translateX.value = getThumbPosition(currentValue, sliderWidth.value);
      }
    }, [currentValue, getThumbPosition, isThumbActive]);

    React.useEffect(() => {
      setActiveValueJS(currentValue);
    }, [currentValue]);

    React.useEffect(() => {
      lastEmittedActiveValue.value = currentValue;
    }, [currentValue]);

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

    // Tap 手势用于拦截点击，防止事件透传到父级可点击容器
    const tapGesture = Gesture.Tap().enabled(true);

    const panGesture = Gesture.Pan()
      .enabled(!disabled)
      // 让手势更快进入活跃态，提升“跟手”体验
      .minDistance(0)
      .hitSlop({ horizontal: 12, vertical: 12 })
      .shouldCancelWhenOutside(false)
      .onBegin(() => {
        isDragging.value = true;
        startX.value = translateX.value;
        runOnJS(setIsThumbActive)(true);
      })
      .onUpdate((event) => {
        const newPosition = Math.max(
          0,
          Math.min(sliderWidth.value, startX.value + event.translationX),
        );

        // 拖动过程中，拇指与轨道连续跟随手势，视觉更顺滑
        translateX.value = newPosition;

        // 计算对应的值（按步长/刻度取整），仅在实际变化时再触发回调
        const newValue = getValueFromPosition(newPosition, sliderWidth.value);
        if (lastEmittedActiveValue.value !== newValue) {
          lastEmittedActiveValue.value = newValue;
          runOnJS(handleValueChange)(newValue);
          runOnJS(setActiveValueJS)(newValue);
        }
      })
      .onEnd(() => {
        isDragging.value = false;
        const newValue = getValueFromPosition(translateX.value, sliderWidth.value);
        // 确保最终位置精确对齐到步长/刻度
        const finalPosition = getThumbPosition(newValue, sliderWidth.value);
        translateX.value = finalPosition;
        runOnJS(handleValueChangeComplete)(newValue);
        if (lastEmittedActiveValue.value !== newValue) {
          lastEmittedActiveValue.value = newValue;
          runOnJS(setActiveValueJS)(newValue);
        }
        runOnJS(setIsThumbActive)(false);
      })
      // 与 Tap 同时识别，避免等待冲突导致的触发延迟
      .simultaneousWithExternalGesture(tapGesture);

    // 同步允许 Tap 与 Pan 同时识别，避免相互等待
    tapGesture.simultaneousWithExternalGesture(panGesture);

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
        // 触发重新渲染用于 marks 定位
        runOnJS(setLayoutWidth)(width);
      },
      [currentValue, getThumbPosition, sliderWidth, translateX],
    );

    const marksNodes = useMemo(() => {
      if (!marks || layoutWidth <= 0) return null;
      if (markValues.length === 0) return null;

      return markValues.map((mv) => {
        const percentage = (mv - min) / (max - min);
        const left = percentage * layoutWidth;
        const meta = marks[mv];
        const isObj = !!meta && typeof meta === 'object' && 'label' in (meta as any);
        const label = isObj ? (meta as any).label : meta;
        const customStyle = isObj ? (meta as any).style : undefined;

        // 固定 dot 在刻度点位置（不受 label 宽度影响）
        const dotTransform = [{ translateX: -DOT_SIZE / 2 }];

        // label 绝对定位与 dot 水平居中，根据测量宽度计算
        const measuredWidth = labelWidths[mv] ?? 0;
        const labelTransform = [{ translateX: -measuredWidth / 2 }];

        const labelContent =
          typeof label === 'string' || typeof label === 'number' ? (
            <Text style={styles.markLabelText}>{label}</Text>
          ) : (
            label
          );

        const isActive = mv <= activeValueJS;

        return (
          <View key={String(mv)} pointerEvents="none" style={[styles.markItem, { left }]}>
            <View
              style={[
                styles.markDot,
                isActive && styles.markDotActive,
                { left: 0, position: 'absolute', transform: dotTransform },
              ]}
            />
            {label ? (
              <View
                onLayout={(e) => {
                  const w = e.nativeEvent.layout.width;
                  if (labelWidths[mv] !== w) setLabelWidths((prev) => ({ ...prev, [mv]: w }));
                }}
                style={[
                  styles.markLabel,
                  customStyle,
                  { left: 0, position: 'absolute', transform: labelTransform },
                ]}
              >
                {labelContent}
              </View>
            ) : null}
          </View>
        );
      });
    }, [marks, layoutWidth, markValues, labelWidths, activeValueJS, min, max, styles]);

    return (
      <View style={[styles.container, style]}>
        <GestureDetector gesture={tapGesture}>
          <View onLayout={onLayout} style={styles.track}>
            <Animated.View style={[styles.activeTrack, activeTrackAnimatedStyle]} />
            {marksNodes}
            <GestureDetector gesture={panGesture}>
              <Animated.View
                style={[styles.thumb, isThumbActive && styles.thumbActive, thumbAnimatedStyle]}
              />
            </GestureDetector>
          </View>
        </GestureDetector>
      </View>
    );
  },
);

export default Slider;
