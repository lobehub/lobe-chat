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
    title = '',
    extra = undefined,
    largeTitleEnabled = false,
    onScroll,
    scrollComponent,
    loading,
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

    const leftContent = (
      <Flexbox align={'center'} gap={8} horizontal justify={'center'} style={styles.left}>
        {left !== undefined ? (
          left
        ) : showBack ? (
          <ActionIcon clickable={false} icon={ChevronLeft} onPress={() => router.back()} />
        ) : null}
      </Flexbox>
    );

    const loadingContent = loading && (
      <Icon color={theme.colorTextSecondary} icon={Loader2Icon} size={16} spin />
    );

    const extraContent = (
      <Flexbox align={'center'} gap={8} horizontal justify={'center'} style={styles.extra}>
        {extra}
        {largeTitleEnabled && loadingContent}
      </Flexbox>
    );

    const titleContent = (
      <Flexbox align={'center'} gap={8} horizontal justify={'center'} style={styles.title}>
        {largeTitleEnabled ? (
          renderHeaderTitle(headerTitleOpacity)
        ) : typeof title === 'string' ? (
          <Text align={'center'} ellipsis style={styles.titleText} weight={500}>
            {title}
          </Text>
        ) : (
          title
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
        style={[
          {
            paddingLeft: showBack ? 8 : 16,
            paddingRight: 16,
          },
          styles.header,
        ]}
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

    return (
      <SafeAreaView
        edges={['top', 'bottom']}
        style={[styles.container, style]}
        testID="page-container"
      >
        {headerContent}
        {children}
      </SafeAreaView>
    );
  },
);

PageContainer.displayName = 'PageContainer';

export default PageContainer;
