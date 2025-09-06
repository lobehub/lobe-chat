import React, { useEffect } from 'react';
import { View, Text, Alert, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth, useAuthActions } from '@/store/user';
import Button from '@/components/Button';
import { Link, useRouter } from 'expo-router';
import { useStyles } from './styles';
import { setLoginMounted } from '@/navigation/loginState';
import { getLoginErrorKey } from '@/utils/error';

const LoginPage = () => {
  const { t } = useTranslation(['auth', 'error', 'common']);
  const { isLoading } = useAuth();
  const { login } = useAuthActions();
  const router = useRouter();

  const { styles } = useStyles();

  useEffect(() => {
    setLoginMounted(true);
    return () => setLoginMounted(false);
  }, []);

  const handleLogin = async () => {
    try {
      await login();
      // 立即导航到对话页，避免展示 404 页面
      setTimeout(() => router.replace('/chat'), 0);
    } catch (error) {
      const key = getLoginErrorKey(error);
      const message = t(key, { ns: 'error' });
      Alert.alert(t('error.title', { ns: 'error' }), message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header} />

      <View style={styles.content}>
        {/* Logo 和标题 */}
        <View style={styles.welcome}>
          <Image source={require('../../../assets/images/logo.png')} style={styles.logo} />

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
