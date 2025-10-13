import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import type { ComponentType, FC } from 'react';
import { ReactNode, useRef } from 'react';
import {
  Animated,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleProp,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ActionIcon from '@/components/ActionIcon';
import Text from '@/components/Text';
import { useTheme } from '@/components/styles';

import { useStyles } from './style';

export interface PageContainerProps {
  children?: ReactNode;
  extra?: ReactNode;
  largeTitleEnabled?: boolean;
  left?: ReactNode;
  onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  scrollComponent?: ComponentType<any>;
  showBack?: boolean;
  style?: StyleProp<ViewStyle>;
  title?: ReactNode;
}

const PageContainer: FC<PageContainerProps> = ({
  children,
  style,
  left = undefined,
  showBack = false,
  title = '',
  extra = undefined,
  largeTitleEnabled = false,
  onScroll,
  scrollComponent,
}) => {
  const { styles } = useStyles();
  const token = useTheme();
  const scrollY = useRef(new Animated.Value(0)).current;

  const LARGE_TITLE_HEIGHT = 34 + token.paddingSM + token.paddingSM;

  const headerTitleOpacity = scrollY.interpolate({
    extrapolate: 'clamp',
    inputRange: [LARGE_TITLE_HEIGHT - 20, LARGE_TITLE_HEIGHT],
    outputRange: [0, 1],
  });

  const handleScroll = Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
    useNativeDriver: false,
  });

  const composedOnScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    handleScroll(event);
    onScroll?.(event);
  };

  const ScrollComponent = scrollComponent || Animated.ScrollView;

  const renderHeaderTitle = (opacity?: Animated.AnimatedInterpolation<number>) => {
    const titleContent =
      typeof title === 'string' ? (
        <Text ellipsizeMode="tail" numberOfLines={1} style={styles.titleText}>
          {title}
        </Text>
      ) : (
        title
      );

    if (opacity) {
      return <Animated.View style={{ opacity }}>{titleContent}</Animated.View>;
    }
    return titleContent;
  };

  // 渲染大标题（作为滚动内容的一部分）
  const renderLargeTitle = () => {
    if (!largeTitleEnabled || !title) return null;

    return (
      <View style={styles.largeTitle}>
        {typeof title === 'string' ? <Text style={styles.largeTitleText}>{title}</Text> : title}
      </View>
    );
  };

  if (largeTitleEnabled) {
    return (
      <SafeAreaView edges={['top', 'bottom']} style={[styles.container, style]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.left}>
            {left !== undefined ? (
              left
            ) : showBack ? (
              <ActionIcon icon={ChevronLeft} onPress={() => router.back()} />
            ) : null}
          </View>
          <View style={styles.title}>{renderHeaderTitle(headerTitleOpacity)}</View>
          <View style={styles.extra}>{extra}</View>
        </View>

        <ScrollComponent
          contentContainerStyle={styles.scrollContent}
          contentInsetAdjustmentBehavior="never"
          onScroll={composedOnScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          style={styles.scrollContainer}
        >
          {renderLargeTitle()}
          {children}
        </ScrollComponent>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={[styles.container, style]}>
      <View style={styles.header}>
        <View style={styles.left}>
          {left !== undefined ? (
            left
          ) : showBack ? (
            <ActionIcon icon={ChevronLeft} onPress={() => router.back()} />
          ) : null}
        </View>
        <View style={styles.title}>
          {typeof title === 'string' ? (
            <Text ellipsizeMode="tail" numberOfLines={1} style={styles.titleText}>
              {title}
            </Text>
          ) : (
            title
          )}
        </View>
        <View style={styles.extra}>{extra}</View>
      </View>
      {children}
    </SafeAreaView>
  );
};

export default PageContainer;
