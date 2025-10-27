import { LobeHub } from '@lobehub/icons-rn';
import {
  Button,
  Center,
  Flexbox,
  PageContainer,
  Text,
  useTheme,
  useThemeMode,
} from '@lobehub/ui-rn';
import { Image } from 'expo-image';
import { Link, useRouter } from 'expo-router';
import { VideoView, useVideoPlayer } from 'expo-video';
import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { setLoginMounted } from '@/navigation/loginState';
import { useSettingStore } from '@/store/setting';
import { useAuth, useAuthActions } from '@/store/user';
import { isDev } from '@/utils/env';
import { getLoginErrorKey } from '@/utils/error';

const LoginPage = () => {
  const theme = useTheme();
  const { isDarkMode } = useThemeMode();
  const { t } = useTranslation(['auth', 'error', 'common', 'welcome']);
  const { isLoading } = useAuth();
  const { login } = useAuthActions();
  const router = useRouter();

  const { setCustomServerUrl, showSelfHostedEntry } = useSettingStore((state) => ({
    setCustomServerUrl: state.setCustomServerUrl,
    showSelfHostedEntry: state.showSelfHostedEntry,
  }));

  useEffect(() => {
    setLoginMounted(true);
    return () => setLoginMounted(false);
  }, []);

  const handleLogin = async () => {
    try {
      setCustomServerUrl('');

      await login();
      // 立即导航到对话页，避免展示 404 页面
      setTimeout(() => router.replace('/chat'), 0);
    } catch (error) {
      const key = getLoginErrorKey(error);
      const message = t(key, { ns: 'error' });
      Alert.alert(t('error.title', { ns: 'error' }), message);
    }
  };

  const handleSelfHostedLogin = () => {
    router.push('/auth/login/selfhost');
  };

  // 根据主题选择视频源
  const videoSource = useMemo(
    () =>
      isDarkMode
        ? require('@/../assets/videos/landing-dark.mp4')
        : require('@/../assets/videos/landing-light.mp4'),
    [isDarkMode],
  );

  // 使用 expo-video 的播放器
  const player = useVideoPlayer(videoSource, (player) => {
    player.loop = true;
    player.muted = true;
    player.play();
  });

  return (
    <PageContainer backgroundColor={isDarkMode ? '#000000' : '#FFFFFF'}>
      <Flexbox flex={1}>
        <Center
          flex={1}
          gap={24}
          paddingInline={16}
          style={{
            paddingTop: '20%',
          }}
        >
          <Image
            cachePolicy="memory-disk"
            source={require('@/../assets/images/logo.png')}
            style={{
              height: 100,
              width: 100,
            }}
            transition={200}
          />
          <Flexbox align={'center'} gap={8} horizontal>
            <Text fontSize={26} weight={'bold'}>
              {t('title', { ns: 'welcome' })}
            </Text>
            <LobeHub.Text color={theme.colorText} size={24} />
          </Flexbox>
        </Center>
        <VideoView
          contentFit="cover"
          player={player}
          style={{
            height: 150,
            left: 0,
            right: 0,
          }}
        />
        <Flexbox
          gap={36}
          padding={16}
          style={{
            paddingTop: 24,
          }}
        >
          {/* 登录按钮 */}
          <Flexbox gap={12}>
            <Button
              block
              disabled={isLoading}
              loading={isLoading}
              onPress={handleLogin}
              type={'primary'}
            >
              {t('login.loginWithLobeHub', { appName: 'LobeHub', ns: 'auth' })}
            </Button>
            {showSelfHostedEntry && (
              <Button block disabled={isLoading} onPress={handleSelfHostedLogin} variant={'filled'}>
                {t('login.selfHostedButton', { ns: 'auth' })}
              </Button>
            )}
            {isDev && (
              <Link asChild href="/playground">
                <Button block variant={'filled'}>
                  {'Playground'}
                </Button>
              </Link>
            )}
          </Flexbox>
          <Flexbox align={'center'} gap={16} horizontal justify={'center'}>
            <Link href="https://lobehub.com/terms">
              <Text fontSize={12} type={'secondary'}>
                {t('login.usePolicy', { ns: 'auth' })}
              </Text>
            </Link>
            <Link href="https://lobehub.com/privacy">
              <Text fontSize={12} type={'secondary'}>
                {t('login.privacyPolicy', { ns: 'auth' })}
              </Text>
            </Link>
          </Flexbox>
        </Flexbox>
      </Flexbox>
    </PageContainer>
  );
};

export default LoginPage;
