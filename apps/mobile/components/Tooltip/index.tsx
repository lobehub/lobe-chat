import { Portal } from '@gorhom/portal';
import React, { ReactNode, useCallback, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  GestureResponderEvent,
  LayoutChangeEvent,
  LayoutRectangle,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

import { useTheme, useThemeToken } from '@/mobile/theme';
import { useStyles } from './style';

export type TooltipPlacement =
  | 'top'
  | 'topLeft'
  | 'topRight'
  | 'bottom'
  | 'bottomLeft'
  | 'bottomRight'
  | 'left'
  | 'leftTop'
  | 'leftBottom'
  | 'right'
  | 'rightTop'
  | 'rightBottom';

export type TooltipTrigger = 'click' | 'longPress' | 'none';

export interface TooltipProps {
  /** 是否显示箭头 */
  arrow?: boolean;
  /** 子组件 */
  children: ReactNode;
  /** 气泡框颜色 */
  color?: string;
  /** 显示隐藏的回调 */
  onVisibleChange?: (visible: boolean) => void;
  /** 自定义样式 */
  overlayStyle?: ViewStyle;
  /** 气泡框位置 */
  placement?: TooltipPlacement;
  /** 文字样式 */
  textStyle?: TextStyle;
  /** 提示文字或内容 */
  title: string | ReactNode;
  /** 触发行为 */
  trigger?: TooltipTrigger;
  /** 是否可见（受控模式） */
  visible?: boolean;
  /** z-index */
  zIndex?: number;
}

interface Position {
  left: number;
  top: number;
}

interface ArrowPosition {
  bottom?: number;
  left?: number;
  right?: number;
  top?: number;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const ARROW_SIZE = 5;
const TOOLTIP_PADDING = 8;
const MARGIN = 4;
const BORDER_RADIUS = 6;
const ARROW_SAFE_MARGIN = 8;

export const Tooltip: React.FC<TooltipProps> = ({
  title,
  children,
  placement = 'top',
  trigger = 'longPress',
  arrow = true,
  color,
  visible: controlledVisible,
  onVisibleChange,
  overlayStyle,
  textStyle,
  zIndex = 1000,
}) => {
  const token = useThemeToken();
  useTheme();
  const { styles } = useStyles();

  const [internalVisible, setInternalVisible] = useState(false);
  const [childLayout, setChildLayout] = useState<LayoutRectangle | null>(null);
  const [tooltipLayout, setTooltipLayout] = useState<LayoutRectangle | null>(null);
  const [actualPlacement, setActualPlacement] = useState<TooltipPlacement>(placement);
  const [pressPosition, setPressPosition] = useState<{ x: number; y: number } | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const childRef = useRef<View>(null);
  const tooltipPositionCache = useRef<{
    arrowPosition: ArrowPosition;
    placement: TooltipPlacement;
    position: Position;
  } | null>(null);

  const isControlled = controlledVisible !== undefined;
  const visible = isControlled ? controlledVisible : internalVisible;

  const toggleVisible = useCallback(
    (newVisible: boolean) => {
      if (isControlled) {
        onVisibleChange?.(newVisible);
      } else {
        setInternalVisible(newVisible);
      }
    },
    [isControlled, onVisibleChange],
  );

  const showTooltip = useCallback(() => {
    if (childRef.current) {
      childRef.current.measure((fx, fy, width, height, px, py) => {
        if (width > 0 && height > 0) {
          setChildLayout({ height, width, x: px, y: py });
          toggleVisible(true);
          Animated.timing(fadeAnim, {
            duration: 200,
            toValue: 1,
            useNativeDriver: true,
          }).start();
        }
      });
    }
  }, [toggleVisible, fadeAnim]);

  const hideTooltip = useCallback(() => {
    Animated.timing(fadeAnim, {
      duration: 150,
      toValue: 0,
      useNativeDriver: true,
    }).start(() => {
      toggleVisible(false);
    });
  }, [toggleVisible, fadeAnim]);

  const handleChildPress = useCallback(() => {
    if (trigger === 'click') {
      if (visible) {
        hideTooltip();
      } else {
        showTooltip();
      }
    }
  }, [trigger, visible, showTooltip, hideTooltip]);

  const handleChildLongPress = useCallback(
    (event: GestureResponderEvent) => {
      if (trigger === 'longPress') {
        const { pageX, pageY } = event.nativeEvent;
        childRef.current?.measure(() => {
          setPressPosition({ x: pageX, y: pageY });
          showTooltip();
        });
      }
    },
    [trigger, showTooltip],
  );

  // 计算最佳位置
  const calculatePosition = useCallback(
    (
      childLayout: LayoutRectangle,
      tooltipLayout: LayoutRectangle,
      preferredPlacement: TooltipPlacement,
    ): { arrowPosition: ArrowPosition; placement: TooltipPlacement; position: Position } => {
      const { x: childX, y: childY, width: childWidth, height: childHeight } = childLayout;
      const { width: tooltipWidth, height: tooltipHeight } = tooltipLayout;

      // 如果存在按压位置，使用按压位置作为参考点
      const referenceX = pressPosition ? pressPosition.x : childX + childWidth / 2;
      const referenceY = pressPosition ? pressPosition.y : childY + childHeight / 2;

      const minArrow = BORDER_RADIUS + ARROW_SAFE_MARGIN;
      const maxArrowW = tooltipWidth - BORDER_RADIUS - ARROW_SAFE_MARGIN - ARROW_SIZE * 2;
      // const maxArrowH = tooltipHeight - BORDER_RADIUS - ARROW_SAFE_MARGIN - ARROW_SIZE * 2;

      // 计算箭头位置
      const calculateArrowPosition = (contentLeft: number): number => {
        const arrowPosition = referenceX - contentLeft - ARROW_SIZE;
        return Math.max(minArrow, Math.min(arrowPosition, maxArrowW));
      };

      // 计算内容区域位置
      const calculateContentPosition = (): { arrowLeft: number; left: number } => {
        // 尝试居中放置
        const centerLeft = referenceX - tooltipWidth / 2;

        // 检查居中是否可行
        if (
          centerLeft >= TOOLTIP_PADDING &&
          centerLeft + tooltipWidth <= screenWidth - TOOLTIP_PADDING
        ) {
          return {
            arrowLeft: tooltipWidth / 2 - ARROW_SIZE,
            left: centerLeft,
          };
        }

        // 如果居中不可行，根据参考点位置决定靠左还是靠右
        let left: number;
        if (referenceX < screenWidth / 2) {
          // 靠左放置
          left = Math.max(TOOLTIP_PADDING, referenceX - tooltipWidth / 2);
        } else {
          // 靠右放置
          left = Math.min(
            screenWidth - tooltipWidth - TOOLTIP_PADDING,
            referenceX - tooltipWidth / 2,
          );
        }

        // 确保不超出屏幕边界
        left = Math.max(
          TOOLTIP_PADDING,
          Math.min(left, screenWidth - tooltipWidth - TOOLTIP_PADDING),
        );

        return {
          arrowLeft: calculateArrowPosition(left),
          left,
        };
      };

      // 计算垂直方向的箭头位置
      const calculateVerticalArrowPosition = (contentTop: number): number => {
        const arrowPosition = referenceY - contentTop - ARROW_SIZE;
        const minArrowY = BORDER_RADIUS + ARROW_SAFE_MARGIN;
        const maxArrowY = tooltipHeight - BORDER_RADIUS - ARROW_SAFE_MARGIN - ARROW_SIZE * 2;
        return Math.max(minArrowY, Math.min(arrowPosition, maxArrowY));
      };

      const positions: Record<
        TooltipPlacement,
        () => { arrowPosition: ArrowPosition; position: Position }
      > = {
        bottom: () => {
          const { left: contentLeft, arrowLeft } = calculateContentPosition();
          return {
            arrowPosition: {
              left: arrowLeft,
              top: -ARROW_SIZE,
            },
            position: {
              left: contentLeft,
              top: referenceY + ARROW_SIZE + MARGIN,
            },
          };
        },
        bottomLeft: () => {
          const { left: contentLeft, arrowLeft } = calculateContentPosition();
          return {
            arrowPosition: {
              left: arrowLeft,
              top: -ARROW_SIZE,
            },
            position: {
              left: contentLeft,
              top: referenceY + ARROW_SIZE + MARGIN,
            },
          };
        },
        bottomRight: () => {
          const { left: contentLeft, arrowLeft } = calculateContentPosition();
          return {
            arrowPosition: {
              left: arrowLeft,
              top: -ARROW_SIZE,
            },
            position: {
              left: contentLeft,
              top: referenceY + ARROW_SIZE + MARGIN,
            },
          };
        },
        left: () => {
          const contentTop = referenceY - tooltipHeight / 2;
          const arrowTop = calculateVerticalArrowPosition(contentTop);
          return {
            arrowPosition: {
              right: -ARROW_SIZE,
              top: arrowTop,
            },
            position: {
              left: referenceX - tooltipWidth - ARROW_SIZE - MARGIN,
              top: contentTop,
            },
          };
        },
        leftBottom: () => {
          const contentTop = referenceY - tooltipHeight + childHeight;
          const arrowTop = calculateVerticalArrowPosition(contentTop);
          return {
            arrowPosition: {
              right: -ARROW_SIZE,
              top: arrowTop,
            },
            position: {
              left: referenceX - tooltipWidth - ARROW_SIZE - MARGIN,
              top: contentTop,
            },
          };
        },
        leftTop: () => {
          const contentTop = referenceY - childHeight;
          const arrowTop = calculateVerticalArrowPosition(contentTop);
          return {
            arrowPosition: {
              right: -ARROW_SIZE,
              top: arrowTop,
            },
            position: {
              left: referenceX - tooltipWidth - ARROW_SIZE - MARGIN,
              top: contentTop,
            },
          };
        },
        right: () => {
          const contentTop = referenceY - tooltipHeight / 2;
          const arrowTop = calculateVerticalArrowPosition(contentTop);
          return {
            arrowPosition: {
              left: -ARROW_SIZE,
              top: arrowTop,
            },
            position: {
              left: referenceX + ARROW_SIZE + MARGIN,
              top: contentTop,
            },
          };
        },
        rightBottom: () => {
          const contentTop = referenceY - tooltipHeight + childHeight;
          const arrowTop = calculateVerticalArrowPosition(contentTop);
          return {
            arrowPosition: {
              left: -ARROW_SIZE,
              top: arrowTop,
            },
            position: {
              left: referenceX + ARROW_SIZE + MARGIN,
              top: contentTop,
            },
          };
        },
        rightTop: () => {
          const contentTop = referenceY - childHeight;
          const arrowTop = calculateVerticalArrowPosition(contentTop);
          return {
            arrowPosition: {
              left: -ARROW_SIZE,
              top: arrowTop,
            },
            position: {
              left: referenceX + ARROW_SIZE + MARGIN,
              top: contentTop,
            },
          };
        },
        top: () => {
          const { left: contentLeft, arrowLeft } = calculateContentPosition();
          return {
            arrowPosition: {
              bottom: -ARROW_SIZE,
              left: arrowLeft,
            },
            position: {
              left: contentLeft,
              top: pressPosition
                ? pressPosition.y - tooltipHeight - ARROW_SIZE - MARGIN
                : referenceY - tooltipHeight - ARROW_SIZE - MARGIN,
            },
          };
        },
        topLeft: () => {
          const { left: contentLeft, arrowLeft } = calculateContentPosition();
          return {
            arrowPosition: {
              bottom: -ARROW_SIZE,
              left: arrowLeft,
            },
            position: {
              left: contentLeft,
              top: pressPosition
                ? pressPosition.y - tooltipHeight - ARROW_SIZE - MARGIN
                : referenceY - tooltipHeight - ARROW_SIZE - MARGIN,
            },
          };
        },
        topRight: () => {
          const { left: contentLeft, arrowLeft } = calculateContentPosition();
          return {
            arrowPosition: {
              bottom: -ARROW_SIZE,
              left: arrowLeft,
            },
            position: {
              left: contentLeft,
              top: pressPosition
                ? pressPosition.y - tooltipHeight - ARROW_SIZE - MARGIN
                : referenceY - tooltipHeight - ARROW_SIZE - MARGIN,
            },
          };
        },
      };

      // 检查位置是否在屏幕范围内
      const checkPosition = (pos: Position): boolean => {
        return (
          pos.left >= TOOLTIP_PADDING &&
          pos.left + tooltipWidth <= screenWidth - TOOLTIP_PADDING &&
          pos.top >= TOOLTIP_PADDING &&
          pos.top + tooltipHeight <= screenHeight - TOOLTIP_PADDING
        );
      };

      // 首先尝试首选位置
      const preferredResult = positions[preferredPlacement]();
      if (checkPosition(preferredResult.position)) {
        return { ...preferredResult, placement: preferredPlacement };
      }

      // 如果首选位置不合适，尝试其他位置
      const fallbackOrder: TooltipPlacement[] = ['top', 'bottom', 'left', 'right'];
      for (const fallbackPlacement of fallbackOrder) {
        if (fallbackPlacement !== preferredPlacement) {
          const result = positions[fallbackPlacement]();
          if (checkPosition(result.position)) {
            return { ...result, placement: fallbackPlacement };
          }
        }
      }

      // 如果都不合适，使用首选位置并调整到屏幕边界内
      const adjustedPosition = { ...preferredResult.position };
      adjustedPosition.left = Math.max(
        TOOLTIP_PADDING,
        Math.min(adjustedPosition.left, screenWidth - tooltipWidth - TOOLTIP_PADDING),
      );
      adjustedPosition.top = Math.max(
        TOOLTIP_PADDING,
        Math.min(adjustedPosition.top, screenHeight - tooltipHeight - TOOLTIP_PADDING),
      );

      return {
        arrowPosition: preferredResult.arrowPosition,
        placement: preferredPlacement,
        position: adjustedPosition,
      };
    },
    [pressPosition],
  );

  // 计算 tooltip 位置和箭头位置
  const tooltipPosition = React.useMemo(() => {
    if (!childLayout || !visible) {
      return tooltipPositionCache.current;
    }

    const defaultTooltipLayout = tooltipLayout || { height: 40, width: 200, x: 0, y: 0 };

    // 如果提供了按压位置，使用按压位置作为参考点
    if (pressPosition) {
      const { x, y } = pressPosition;
      const childLayoutWithPress = {
        height: 1,
        width: 1,
        x,
        y,
      };
      const position = calculatePosition(childLayoutWithPress, defaultTooltipLayout, placement);
      tooltipPositionCache.current = position;
      return position;
    }

    const position = calculatePosition(childLayout, defaultTooltipLayout, placement);
    tooltipPositionCache.current = position;
    return position;
  }, [childLayout, tooltipLayout, visible, placement, pressPosition]);

  React.useEffect(() => {
    if (tooltipPosition) {
      setActualPlacement(tooltipPosition.placement);
    }
  }, [tooltipPosition]);

  const onTooltipLayout = useCallback((event: LayoutChangeEvent) => {
    const { layout } = event.nativeEvent;
    setTooltipLayout(layout);
  }, []);

  const getArrowStyle = (placement: TooltipPlacement): ViewStyle => {
    const baseStyle = {
      height: ARROW_SIZE * 2,
      position: 'absolute' as const,
      transform: [{ rotate: '45deg' }],
      width: ARROW_SIZE * 2,
    };

    // 根据 placement 返回不同的样式
    switch (placement) {
      case 'top':
      case 'topLeft':
      case 'topRight': {
        return {
          ...baseStyle,
          bottom: -ARROW_SIZE + 1,
        };
      }
      case 'bottom':
      case 'bottomLeft':
      case 'bottomRight': {
        return {
          ...baseStyle,
          top: -ARROW_SIZE + 1,
        };
      }
      case 'left':
      case 'leftTop':
      case 'leftBottom': {
        return {
          ...baseStyle,
          right: -ARROW_SIZE + 1,
          transform: [{ rotate: '45deg' }],
        };
      }
      case 'right':
      case 'rightTop':
      case 'rightBottom': {
        return {
          ...baseStyle,
          left: -ARROW_SIZE + 1,
          transform: [{ rotate: '45deg' }],
        };
      }
      default: {
        return baseStyle;
      }
    }
  };

  const renderTooltip = () => {
    if (!visible) {
      return null;
    }

    if (!tooltipPosition) {
      return null;
    }

    const { position, arrowPosition } = tooltipPosition;
    const tooltipColor = color || token.colorTextBase;

    return (
      <Portal>
        <View style={[styles.overlay, { zIndex }]}>
          <TouchableOpacity activeOpacity={1} onPress={hideTooltip} style={styles.overlayTouchable}>
            <Animated.View
              onLayout={onTooltipLayout}
              style={[
                styles.tooltip,
                {
                  backgroundColor: tooltipColor,
                  left: position.left,
                  opacity: fadeAnim,
                  position: 'absolute',
                  top: position.top,
                },
                overlayStyle,
              ]}
            >
              {typeof title === 'string' ? (
                <Text style={[styles.tooltipText, textStyle]}>{title}</Text>
              ) : (
                title
              )}
              {arrow && (
                <View
                  style={[
                    styles.arrow,
                    {
                      backgroundColor: tooltipColor,
                      ...arrowPosition,
                    },
                    getArrowStyle(actualPlacement),
                  ]}
                />
              )}
            </Animated.View>
          </TouchableOpacity>
        </View>
      </Portal>
    );
  };

  const childProps: any = {
    ref: childRef,
  };

  if (trigger === 'click') {
    childProps.onPress = handleChildPress;
  } else if (trigger === 'longPress') {
    childProps.onLongPress = handleChildLongPress;
  }

  const clonedChild = React.isValidElement(children)
    ? React.cloneElement(children, {
        ...childProps,
        ref: childRef,
      })
    : children;

  return (
    <View style={styles.container}>
      {clonedChild}
      {renderTooltip()}
    </View>
  );
};

export default Tooltip;
