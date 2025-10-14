import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { LayoutChangeEvent, Pressable } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { cva } from '@/components/styles';

import Flexbox from '../Flexbox';
import { SegmentedIcon } from './SegmentedIcon';
import { SegmentedText } from './SegmentedText';
import { useStyles } from './style';
import type { SegmentedItemType, SegmentedProps } from './type';

const Segmented = memo<SegmentedProps>(
  ({
    options = [],
    value,
    defaultValue,
    onChange,
    size = 'middle',
    shape = 'default',
    disabled = false,
    block = false,
    vertical = false,
    style,
  }) => {
    const { styles } = useStyles();
    const [internalValue, setInternalValue] = useState<string | number | undefined>(
      value ?? defaultValue,
    );

    // 动画相关状态
    const indicatorOffset = useSharedValue(0);
    const indicatorSize = useSharedValue(0);
    const indicatorWidth = useSharedValue(0); // 垂直模式下的指示器宽度
    const [segmentLayouts, setSegmentLayouts] = useState<
      Record<string | number, { height: number; width: number; x: number; y: number }>
    >({});

    // 当前选中的值（受控或非受控）
    const currentValue = value !== undefined ? value : internalValue;

    // 使用 CVA 管理 segment 样式
    const segmentCva = useMemo(
      () =>
        cva(styles.segmentBase, {
          defaultVariants: {
            block: false,
            disabled: false,
            pressed: false,
            shape: 'default',
            size: 'middle',
          },
          variants: {
            block: {
              false: null,
              true: styles.segmentBlock,
            },
            disabled: {
              false: null,
              true: styles.segmentDisabled,
            },
            pressed: {
              false: null,
              true: styles.segmentPressed,
            },
            shape: {
              default: null,
              round: styles.segmentRound,
            },
            size: {
              large: styles.segmentLarge,
              middle: styles.segmentMiddle,
              small: styles.segmentSmall,
            },
          },
        }),
      [styles],
    );

    // 标准化选项数据
    const normalizedOptions = useMemo(() => {
      return options.map((option) => {
        if (typeof option === 'string' || typeof option === 'number') {
          return {
            disabled: false,
            label: String(option),
            value: option,
          };
        }
        return option as SegmentedItemType;
      });
    }, [options]);

    // 更新选中指示器位置
    useEffect(() => {
      if (currentValue !== undefined && segmentLayouts[currentValue]) {
        const layout = segmentLayouts[currentValue];
        const offset = vertical ? layout.y : layout.x;
        const size = vertical ? layout.height : layout.width;

        indicatorOffset.value = withTiming(offset, {
          duration: 250,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        });
        indicatorSize.value = withTiming(size, {
          duration: 250,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        });

        // 垂直模式下也追踪宽度
        if (vertical) {
          indicatorWidth.value = withTiming(layout.width, {
            duration: 250,
            easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          });
        }
      }
    }, [currentValue, segmentLayouts, indicatorOffset, indicatorSize, indicatorWidth, vertical]);

    // 处理选项布局变化
    const handleSegmentLayout = useCallback(
      (optionValue: string | number, event: LayoutChangeEvent) => {
        const { x, y, width, height } = event.nativeEvent.layout;
        setSegmentLayouts((prev) => ({
          ...prev,
          [optionValue]: { height, width, x, y },
        }));
      },
      [],
    );

    // 处理选项点击
    const handlePress = useCallback(
      (optionValue: string | number, optionDisabled?: boolean) => {
        if (disabled || optionDisabled) return;

        // 非受控模式下更新内部状态
        if (value === undefined) {
          setInternalValue(optionValue);
        }

        // 触发回调
        onChange?.(optionValue);
      },
      [disabled, value, onChange],
    );

    // 指示器动画样式
    const indicatorAnimatedStyle = useAnimatedStyle(() => {
      if (vertical) {
        return {
          height: indicatorSize.value,
          left: 2,
          top: 2,
          transform: [{ translateY: indicatorOffset.value }],
          width: indicatorWidth.value,
        };
      }
      return {
        bottom: 2,
        left: 2,
        top: 2,
        transform: [{ translateX: indicatorOffset.value }],
        width: indicatorSize.value,
      };
    });

    return (
      <Flexbox
        style={[
          styles.container,
          shape === 'round' && styles.containerRound,
          block && styles.containerBlock,
          style,
        ]}
      >
        {/* 选中指示器 */}
        {currentValue !== undefined && (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.indicator,
              shape === 'round' && styles.indicatorRound,
              indicatorAnimatedStyle,
            ]}
          />
        )}

        {/* 选项列表 */}
        <Flexbox horizontal={!vertical}>
          {normalizedOptions.map((option, index) => {
            const isSelected = currentValue === option.value;
            const isDisabled = disabled || option.disabled;
            const hasIcon = 'icon' in option && option.icon;
            const hasLabel = typeof option.label === 'string' && option.label;

            return (
              <Pressable
                disabled={isDisabled}
                key={`${option.value}-${index}`}
                onLayout={(e) => handleSegmentLayout(option.value, e)}
                onPress={() => handlePress(option.value, option.disabled)}
                style={({ pressed }) =>
                  segmentCva({
                    block,
                    disabled: isDisabled,
                    pressed: pressed && !isDisabled,
                    shape,
                    size,
                  })
                }
              >
                <Flexbox
                  align="center"
                  gap={hasIcon && hasLabel ? 8 : undefined}
                  horizontal={!!(hasIcon && hasLabel)}
                >
                  {hasIcon && (
                    <SegmentedIcon
                      icon={option.icon}
                      isDisabled={!!isDisabled}
                      isSelected={isSelected}
                      size={size === 'small' ? 16 : size === 'large' ? 20 : 18}
                    />
                  )}
                  {hasLabel ? (
                    <SegmentedText
                      isDisabled={!!isDisabled}
                      isSelected={isSelected}
                      label={option.label as string}
                      size={size}
                    />
                  ) : typeof option.label !== 'string' && option.label ? (
                    option.label
                  ) : null}
                </Flexbox>
              </Pressable>
            );
          })}
        </Flexbox>
      </Flexbox>
    );
  },
);

Segmented.displayName = 'Segmented';

export default Segmented;
