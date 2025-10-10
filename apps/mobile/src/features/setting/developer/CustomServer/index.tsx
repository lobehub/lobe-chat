import { Button, Input, Toast } from '@lobehub/ui-rn';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Form } from '@/components';
import { DEFAULT_SERVER_URL, formatServerUrl, isValidServerUrl } from '@/config/server';
import { useSettingStore } from '@/store/setting';

import { useStyles } from './style';

const CustomServer = () => {
  const { t } = useTranslation(['setting']);
  const { styles } = useStyles();
  const { customServerUrl, setCustomServerUrl } = useSettingStore();
  const [form] = Form.useForm();

  const currentServer = customServerUrl ?? DEFAULT_SERVER_URL;

  useEffect(() => {
    void form.setFieldsValue(
      { customServer: customServerUrl ?? '' },
      { markTouched: false, validate: false },
    );
  }, [customServerUrl, form]);

  const applyCustomServer = async () => {
    try {
      const values = await form.validateFields(['customServer']);
      const rawValue = (values.customServer as string | undefined) ?? '';
      const trimmed = rawValue.trim();

      if (!trimmed) {
        setCustomServerUrl(null);
        Toast.success(t('developer.customServer.resetSuccess', { ns: 'setting' }));
        return;
      }

      setCustomServerUrl(formatServerUrl(trimmed));
      Toast.success(t('developer.customServer.updated', { ns: 'setting' }));
    } catch {
      // Validation errors are surfaced via the form.
    }
  };

  const resetCustomServer = async () => {
    setCustomServerUrl(null);
    await form.setFieldsValue(
      { customServer: DEFAULT_SERVER_URL },
      { markTouched: false, validate: false },
    );
    Toast.success(t('developer.customServer.resetSuccess', { ns: 'setting' }));
  };

  return (
    <Form form={form} initialValues={{ customServer: currentServer }}>
      <Form.Item
        extra={t('developer.customServer.hint', { ns: 'setting' })}
        label={t('developer.customServer.title', { ns: 'setting' })}
        name="customServer"
        rules={[
          {
            validator: (value) => {
              const input = (value as string | undefined)?.trim();
              if (!input) return;
              if (!isValidServerUrl(input)) {
                return t('developer.customServer.invalid', { ns: 'setting' });
              }
            },
          },
        ]}
      >
        <Input
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          onSubmitEditing={applyCustomServer}
          placeholder={t('developer.customServer.placeholder', { ns: 'setting' })}
          returnKeyType="done"
          size="large"
        />
      </Form.Item>
      {/* Action Section */}
      <Form.Item>
        <View style={styles.actionSection}>
          <Button block onPress={applyCustomServer} size="large" type="primary">
            {t('developer.customServer.save', { ns: 'setting' })}
          </Button>
          <Button block onPress={resetCustomServer} size="large" type="default">
            {t('developer.customServer.reset', { ns: 'setting' })}
          </Button>
        </View>
      </Form.Item>
    </Form>
  );
};

export default CustomServer;
