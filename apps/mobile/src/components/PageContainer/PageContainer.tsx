import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ChevronLeft, Loader2Icon } from 'lucide-react-native';
import { memo, useRef } from 'react';
import { Animated, NativeScrollEvent, NativeSyntheticEvent, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HEADER_HEIGHT } from '@/_const/common';
import ActionIcon from '@/components/ActionIcon';
import Icon from '@/components/Icon';
import Text from '@/components/Text';
import { useTheme } from '@/components/styles';

import Flexbox from '../Flexbox';
import { useStyles } from './style';
import type { PageContainerProps } from './type';

const PageContainer = memo<PageContainerProps>(
  ({
    children,
    style,
    left = undefined,
    showBack = false,
    onBackPress = () => router.back(),
    title = '',
    extra = undefined,
    largeTitleEnabled = false,
    onScroll,
    scrollComponent,
    loading,
    backgroundColor,
    onTitlePress,
    titleIcon,
    leftProps,
    titleProps,
    extraProps,
  }) => {
    const { styles, theme } = useStyles();
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
          <Text align={'center'} ellipsis fontSize={16} weight={500}>
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

    const leftContent = (
      <Flexbox
        align={'center'}
        gap={8}
        horizontal
        justify={'flex-start'}
        style={styles.left}
        width={'25%'}
        {...leftProps}
      >
        {left !== undefined ? (
          left
        ) : showBack ? (
          <ActionIcon icon={ChevronLeft} onPress={onBackPress} pressEffect={false} />
        ) : null}
      </Flexbox>
    );

    const loadingContent = loading && (
      <Icon color={theme.colorTextSecondary} icon={Loader2Icon} size={16} spin />
    );

    const extraContent = (
      <Flexbox
        align={'center'}
        gap={8}
        horizontal
        justify={'flex-end'}
        style={styles.extra}
        width={'25%'}
        {...extraProps}
      >
        {extra}
        {largeTitleEnabled && loadingContent}
      </Flexbox>
    );

    const titleContent = (
      <Flexbox
        align={'center'}
        flex={1}
        gap={4}
        height={'100%'}
        horizontal
        justify={'center'}
        onPress={loading ? undefined : onTitlePress}
        padding={4}
        style={styles.title}
        {...titleProps}
      >
        {largeTitleEnabled ? (
          renderHeaderTitle(headerTitleOpacity)
        ) : typeof title === 'string' ? (
          <Text align={'center'} ellipsis fontSize={16} weight={500}>
            {title}
          </Text>
        ) : (
          title
        )}
        {!loading && titleIcon && (
          <Icon color={theme.colorTextSecondary} icon={titleIcon} size={18} />
        )}
        {!largeTitleEnabled && loadingContent}
      </Flexbox>
    );

    const headerContent = (
      <Flexbox
        align={'center'}
        height={HEADER_HEIGHT}
        horizontal
        justify={'space-between'}
        paddingInline={8}
        style={[styles.header]}
      >
        {leftContent}
        {titleContent}
        {extraContent}
      </Flexbox>
    );

    if (largeTitleEnabled) {
      return (
        <SafeAreaView
          edges={['top', 'bottom']}
          style={[styles.container, style]}
          testID="page-container"
        >
          {headerContent}
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

    const isColor = Boolean(!backgroundColor || typeof backgroundColor === 'string');

    const content = (
      <SafeAreaView
        edges={['top', 'bottom']}
        style={[
          styles.container,
          isColor && { backgroundColor: (backgroundColor as string) || theme.colorBgLayout },
          style,
        ]}
        testID="page-container"
      >
        {headerContent}
        {children}
      </SafeAreaView>
    );

    if (isColor) return content;

    return (
      <LinearGradient colors={backgroundColor as any} style={{ flex: 1 }}>
        {content}
      </LinearGradient>
    );
  },
);

PageContainer.displayName = 'PageContainer';

export default PageContainer;
