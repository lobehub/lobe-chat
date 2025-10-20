import { LobeHub } from '@lobehub/icons-rn';
import { Button, Center, Flexbox, PageContainer, Text, useTheme } from '@lobehub/ui-rn';
import { Link, useRouter } from 'expo-router';
import { darken } from 'polished';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Image } from 'react-native';

import { setLoginMounted } from '@/navigation/loginState';
import { useSettingStore } from '@/store/setting';
import { useAuth, useAuthActions } from '@/store/user';
import { isDev } from '@/utils/env';
import { getLoginErrorKey } from '@/utils/error';

const LoginPage = () => {
  const theme = useTheme();
  const { t } = useTranslation(['auth', 'error', 'common']);
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

  return (
    <PageContainer
      backgroundColor={[theme.colorBgContainerSecondary, darken(0.04, theme.colorBgLayout)]}
    >
      <Flexbox flex={1}>
        <Center flex={1} gap={24}>
          <Image
            source={require('@/../assets/images/logo.png')}
            style={{
              height: 100,
              width: 100,
            }}
          />
          <Flexbox align={'center'} gap={8} horizontal>
            <Text fontSize={26} weight={'bold'}>
              欢迎使用
            </Text>
            <LobeHub.Text size={24} />
          </Flexbox>
        </Center>

        <Flexbox gap={36} padding={16}>
          {/* 登录按钮 */}
          <Flexbox gap={8}>
            <Button
              block
              disabled={isLoading}
              loading={isLoading}
              onPress={handleLogin}
              type={'primary'}
            >
              {'通过 LobeHub 账号登录'}
            </Button>
            {showSelfHostedEntry && (
              <Button
                block
                disabled={isLoading}
                onPress={handleSelfHostedLogin}
                variant={'outlined'}
              >
                {t('login.selfHostedButton', { ns: 'auth' })}
              </Button>
            )}
            {isDev && (
              <Link asChild href="/playground">
                <Button block variant={'outlined'}>
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
