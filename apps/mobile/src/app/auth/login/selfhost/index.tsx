import { Button, Input, PageContainer } from '@lobehub/ui-rn';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

import { Form } from '@/components';
import { formatServerUrl, isValidServerUrl } from '@/config/server';
import { setLoginMounted } from '@/navigation/loginState';
import { useAuth, useAuthActions } from '@/store/_user';
import { useSettingStore } from '@/store/setting';
import { handleLoginError } from '@/utils/error';

import { useStyles } from './_features/style';

const CustomServerLoginPage = () => {
  const { t } = useTranslation(['auth', 'error']);
  const { isLoading } = useAuth();
  const { login } = useAuthActions();
  const { customServerUrl, setCustomServerUrl } = useSettingStore((state) => ({
    customServerUrl: state.customServerUrl,
    setCustomServerUrl: state.setCustomServerUrl,
  }));
  const router = useRouter();
  const { styles } = useStyles();
  const [form] = Form.useForm();

  useEffect(() => {
    setLoginMounted(true);
    return () => setLoginMounted(false);
  }, []);

  useEffect(() => {
    void form.setFieldsValue(
      { customServer: customServerUrl ?? '' },
      { markTouched: false, validate: false },
    );
  }, [customServerUrl, form]);

  const handleContinue = async () => {
    try {
      const values = await form.validateFields(['customServer']);
      const rawValue = (values.customServer as string | undefined) ?? '';
      const trimmed = rawValue.trim();

      const formatted = formatServerUrl(trimmed);
      setCustomServerUrl(formatted);

      await login();
      setTimeout(() => router.replace('/chat'), 0);
    } catch (error) {
      if (error && typeof error === 'object' && !('message' in error)) {
        // 表单校验错误已经在组件中展示
        return;
      }

      handleLoginError(error, t);
    }
  };

  return (
    <PageContainer showBack>
      <View style={styles.container}>
        <View style={styles.header} />

        <View style={styles.content}>
          <View style={styles.welcome}>
            <Image
              cachePolicy="memory-disk"
              source={require('@/../assets/images/logo.png')}
              style={styles.logo}
              transition={200}
            />

            <Text style={styles.title}>{t('login.selfHostedTitle', { ns: 'auth' })}</Text>
            <Text style={styles.subtitle}>{t('login.selfHostedDescription', { ns: 'auth' })}</Text>
          </View>

          <Form
            form={form}
            initialValues={{ customServer: customServerUrl ?? '' }}
            style={styles.form}
          >
            <Form.Item
              name="customServer"
              rules={[
                {
                  message: t('login.selfHostedRequired', { ns: 'auth' }),
                  required: true,
                },
                {
                  validator: (value) => {
                    const input = (value as string | undefined)?.trim();
                    if (!input) return;
                    if (!isValidServerUrl(input)) {
                      return t('login.selfHostedInvalid', { ns: 'auth' });
                    }
                  },
                },
              ]}
            >
              <Input
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
                onSubmitEditing={handleContinue}
                placeholder={t('login.selfHostedPlaceholder', { ns: 'auth' })}
                returnKeyType="done"
                variant="outlined"
              />
            </Form.Item>
          </Form>

          <Button
            block
            loading={isLoading}
            onPress={handleContinue}
            style={styles.selfHostedButton}
            type="primary"
          >
            {t('login.selfHostedContinue', { ns: 'auth' })}
          </Button>
        </View>

        <View style={styles.securityNote}>
          <Text style={styles.securityText}>{t('login.selfHostedHint', { ns: 'auth' })}</Text>
        </View>
      </View>
    </PageContainer>
  );
};

export default CustomServerLoginPage;
