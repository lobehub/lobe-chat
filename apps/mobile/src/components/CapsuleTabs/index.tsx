import { Icon, Space } from '@lobehub/ui-rn';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
  Animated,
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { FONT_SIZE_LARGE, FONT_SIZE_SMALL, FONT_SIZE_STANDARD } from '@/_const/common';
import { AggregationColor } from '@/utils/color';

import { useStyles } from './style';
import { CapsuleTabsProps } from './type';

export const CapsuleTabs: React.FC<CapsuleTabsProps> = ({
  items,
  onSelect,
  selectedKey,
  size = 'middle',
  style,
}) => {
  const { styles, theme } = useStyles(size);
  const iconSize =
    size === 'large' ? FONT_SIZE_LARGE : size === 'small' ? FONT_SIZE_SMALL : FONT_SIZE_STANDARD;

  const leftFadeOpacity = React.useRef(new Animated.Value(0)).current;
  const rightFadeOpacity = React.useRef(new Animated.Value(0)).current;
  const layoutWidthRef = React.useRef(0);
  const contentWidthRef = React.useRef(0);
  const scrollOffsetRef = React.useRef(0);
  const [fadeVisible, setFadeVisible] = React.useState({ left: false, right: false });

  const fadeColors = React.useMemo(() => {
    const { r, g, b } = new AggregationColor(theme.colorBgContainer).toRgb();
    const rgba = (alpha: number) => `rgba(${r}, ${g}, ${b}, ${alpha})`;
    return {
      left: [rgba(1), rgba(0)] as const,
      right: [rgba(0), rgba(1)] as const,
    };
  }, [theme.colorBgContainer]);

  const animateFade = React.useCallback((fade: Animated.Value, visible: boolean) => {
    Animated.timing(fade, {
      duration: 50,
      toValue: visible ? 1 : 0,
      useNativeDriver: true,
    }).start();
  }, []);

  React.useEffect(() => {
    animateFade(leftFadeOpacity, fadeVisible.left);
    animateFade(rightFadeOpacity, fadeVisible.right);
  }, [animateFade, fadeVisible.left, fadeVisible.right, leftFadeOpacity, rightFadeOpacity]);

  const updateFadeVisibility = React.useCallback((offsetX?: number) => {
    const layoutWidth = layoutWidthRef.current;
    const contentWidth = contentWidthRef.current;
    const currentOffset = offsetX ?? scrollOffsetRef.current;
    const hasOverflow = contentWidth > layoutWidth + 1;

    const nextState = hasOverflow
      ? {
          left: currentOffset > 1,
          right: currentOffset + layoutWidth < contentWidth - 1,
        }
      : { left: false, right: false };

    setFadeVisible((prev) =>
      prev.left === nextState.left && prev.right === nextState.right ? prev : nextState,
    );
  }, []);

  const handleScroll = React.useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetX = event.nativeEvent.contentOffset.x;
      scrollOffsetRef.current = offsetX;
      updateFadeVisibility(offsetX);
    },
    [updateFadeVisibility],
  );

  const handleLayout = React.useCallback(
    (event: LayoutChangeEvent) => {
      layoutWidthRef.current = event.nativeEvent.layout.width;
      updateFadeVisibility();
    },
    [updateFadeVisibility],
  );

  const handleContentSizeChange = React.useCallback(
    (contentWidth: number) => {
      contentWidthRef.current = contentWidth;
      updateFadeVisibility();
    },
    [updateFadeVisibility],
  );

  React.useEffect(() => {
    updateFadeVisibility();
  }, [updateFadeVisibility]);

  return (
    <View onLayout={handleLayout} style={[styles.wrapper, style]}>
      <ScrollView
        contentContainerStyle={styles.container}
        horizontal
        onContentSizeChange={handleContentSizeChange}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsHorizontalScrollIndicator={false}
        style={styles.scrollView}
      >
        {items.map((item) => {
          const isActive = selectedKey === item.key;
          const iconColor = StyleSheet.flatten(
            isActive ? styles.tabTextActive : styles.tabText,
          )?.color;

          return (
            <TouchableOpacity
              key={item.key}
              onPress={() => onSelect(item.key)}
              style={[styles.tab, isActive && styles.tabActive]}
            >
              <Space>
                {item.icon ? (
                  <View testID={`capsule-tab-icon-${item.key}`}>
                    <Icon color={iconColor} icon={item.icon} size={iconSize} />
                  </View>
                ) : null}
                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{item.label}</Text>
              </Space>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      <>
        <Animated.View pointerEvents="none" style={[styles.fadeLeft, { opacity: leftFadeOpacity }]}>
          <LinearGradient
            colors={fadeColors.left}
            end={{ x: 1, y: 0 }}
            start={{ x: 0, y: 0 }}
            style={styles.fadeGradient}
          />
        </Animated.View>
        <Animated.View
          pointerEvents="none"
          style={[styles.fadeRight, { opacity: rightFadeOpacity }]}
        >
          <LinearGradient
            colors={fadeColors.right}
            end={{ x: 1, y: 0 }}
            start={{ x: 0, y: 0 }}
            style={styles.fadeGradient}
          />
        </Animated.View>
      </>
    </View>
  );
};

export default CapsuleTabs;
export * from './type';
