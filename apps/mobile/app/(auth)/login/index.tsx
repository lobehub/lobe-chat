import React from 'react';
import { View, Text, Alert, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth, useAuthActions } from '@/store/user';
import Button from '@/components/Button';
import { Link, useRouter } from 'expo-router';
import { useStyles } from './styles';

const LoginPage = () => {
  const { t } = useTranslation(['auth', 'error', 'common']);
  const { isLoading } = useAuth();
  const { login } = useAuthActions();
  const router = useRouter();

  const { styles } = useStyles();

  const handleLogin = async () => {
    try {
      await login();
      // Redirect to home page after successful login
      router.replace('/chat');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      Alert.alert(t('error.title', { ns: 'error' }), errorMessage);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header} />

      <View style={styles.content}>
        {/* Logo 和标题 */}
        <View style={styles.welcome}>
          <Image
            source={{
              uri: 'https://hub-apac-1.lobeobjects.space/docs/73f69adfa1b802a0e250f6ff9d62f70b.png',
            }}
            style={styles.logo}
          />
          <Text style={styles.title}>LobeChat</Text>
          <Text style={styles.subtitle}>{t('login.subtitle', { ns: 'auth' })}</Text>
        </View>

        {/* 登录按钮 */}
        <Button
          block
          disabled={isLoading}
          loading={isLoading}
          onPress={handleLogin}
          size="large"
          style={styles.loginButton}
          type="primary"
        >
          {t('login.button', { appName: 'LobeChat.com', ns: 'auth' })}
        </Button>
      </View>

      {/* 安全提示 */}
      <View style={styles.securityNote}>
        <Text style={styles.securityText}>
          {t('login.securityNote', { ns: 'auth' })}
          <Link href="https://lobehub.com/terms" style={styles.securityLink}>
            《{t('login.usePolicy', { ns: 'auth' })}》
          </Link>
          {t('and', { ns: 'common' })}
          <Link href="https://lobehub.com/privacy" style={styles.securityLink}>
            《{t('login.privacyPolicy', { ns: 'auth' })}》
          </Link>
        </Text>
      </View>
    </View>
  );
};

export default LoginPage;
