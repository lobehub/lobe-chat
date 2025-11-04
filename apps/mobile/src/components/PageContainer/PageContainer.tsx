import { router } from 'expo-router';
import { ChevronLeft, Loader2Icon } from 'lucide-react-native';
import { memo, useRef } from 'react';
import { Animated, NativeScrollEvent, NativeSyntheticEvent, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

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
    headerBackgroundColor,
    extraProps,
    safeAreaProps,
    headerStyle,
  }) => {
    const { styles, theme } = useStyles();
    const token = useTheme();
    const scrollY = useRef(new Animated.Value(0)).current;
    const LARGE_TITLE_HEIGHT = 34 + token.paddingSM + token.paddingSM;
    const insets = useSafeAreaInsets();

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

    const headerBg = headerBackgroundColor || backgroundColor || theme.colorBgLayout;

    const headerContent = (
      <>
        <View
          style={[
            styles.header,
            {
              backgroundColor: headerBg,
              height: HEADER_HEIGHT,
              left: 0,
              position: 'absolute',
              right: 0,
              top: 0,
              width: '100%',
              zIndex: 10,
            },
          ]}
        />
        <Flexbox
          align={'center'}
          height={HEADER_HEIGHT}
          horizontal
          justify={'space-between'}
          paddingInline={8}
          style={[
            styles.header,
            {
              backgroundColor: headerBg,
            },
            headerStyle,
          ]}
        >
          {leftContent}
          {titleContent}
          {extraContent}
        </Flexbox>
      </>
    );

    if (largeTitleEnabled) {
      return (
        <SafeAreaView
          edges={['top']}
          style={[styles.container, style]}
          testID="page-container"
          {...safeAreaProps}
        >
          {headerContent}
          <ScrollComponent
            contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom }]}
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
      <SafeAreaView
        edges={['top', 'bottom']}
        style={[
          styles.container,
          { backgroundColor: (backgroundColor as string) || theme.colorBgLayout },
          style,
        ]}
        testID="page-container"
        {...safeAreaProps}
      >
        {headerContent}
        {children}
      </SafeAreaView>
    );
  },
);

PageContainer.displayName = 'PageContainer';

export default PageContainer;
