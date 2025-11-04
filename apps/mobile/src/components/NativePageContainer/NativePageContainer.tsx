import { isLiquidGlassAvailable } from 'expo-glass-effect';
import { Stack, router } from 'expo-router';
import { ChevronLeft, Loader2Icon } from 'lucide-react-native';
import { memo } from 'react';

import ActionIcon from '@/components/ActionIcon';
import Icon from '@/components/Icon';
import Text from '@/components/Text';
import { useThemeMode } from '@/components/styles';
import { isIOS } from '@/utils/detection';

import Flexbox from '../Flexbox';
import { useStyles } from './style';
import type { NativePageContainerProps } from './type';

const NativePageContainer = memo<NativePageContainerProps>(
  ({
    children,
    left = undefined,
    showBack = false,
    onBackPress = () => router.back(),
    title = '',
    extra = undefined,
    largeTitleEnabled = false,
    loading,
    onTitlePress,
    titleIcon,
    leftProps,
    titleProps,

    extraProps,
  }) => {
    const { isDarkMode } = useThemeMode();
    const { styles, theme } = useStyles();
    const isGlassAvailable = isLiquidGlassAvailable();
    const blurEffect = isDarkMode ? 'systemMaterialDark' : 'systemMaterialLight';

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
        {typeof title === 'string' ? (
          <Text align={'center'} ellipsis fontSize={16} weight={500}>
            {title}
          </Text>
        ) : (
          title
        )}
        {!loading && titleIcon && (
          <Icon color={theme.colorTextSecondary} icon={titleIcon} size={18} />
        )}
        {loadingContent}
      </Flexbox>
    );

    return (
      <>
        <Stack.Screen
          options={{
            headerBackButtonMenuEnabled: false,
            headerBackVisible: false,
            headerBlurEffect: isGlassAvailable ? undefined : blurEffect,
            headerLeft: () => leftContent,
            headerRight: () => extraContent,
            headerShadowVisible: false,
            headerShown: true,
            headerStyle: {
              backgroundColor: !isGlassAvailable ? theme.colorBgLayout : 'transparent',
            },
            headerTintColor: theme.colorText,
            headerTitle: () => titleContent,
            headerTransparent: isIOS,
            title: typeof title === 'string' ? title : 'Title',
          }}
        />
        {children}
      </>
    );
  },
);

NativePageContainer.displayName = 'NativePageContainer';

export default NativePageContainer;
