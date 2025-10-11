import { Button, Input, PageContainer } from '@lobehub/ui-rn';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Image, Text, View } from 'react-native';

import { Form } from '@/components';
import { formatServerUrl, isValidServerUrl } from '@/config/server';
import { setLoginMounted } from '@/navigation/loginState';
import { useSettingStore } from '@/store/setting';
import { useAuth, useAuthActions } from '@/store/user';
import { getLoginErrorKey } from '@/utils/error';

import { useStyles } from './style';

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

      const key = getLoginErrorKey(error);
      const message = t(key, { ns: 'error' });

      Alert.alert(t('error.title', { ns: 'error' }), message);
    }
  };

  return (
    <PageContainer showBack style={{ backgroundColor: 'white' }}>
      <View style={styles.container}>
        <View style={styles.header} />

        <View style={styles.content}>
          <View style={styles.welcome}>
            <Image source={require('../../../../assets/images/logo.png')} style={styles.logo} />

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
                size="large"
                variant="outlined"
              />
            </Form.Item>
          </Form>

          <Button
            block
            loading={isLoading}
            onPress={handleContinue}
            size="large"
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
