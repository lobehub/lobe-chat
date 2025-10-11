import { sleep } from '@lobechat/utils';
import { Button, Input, Alert as Notice, Toast } from '@lobehub/ui-rn';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert as RNAlert, View } from 'react-native';

import { Form } from '@/components';
import { DEFAULT_SERVER_URL, formatServerUrl, isValidServerUrl } from '@/config/server';
import { safeReplaceLogin } from '@/navigation/safeLogin';
import { useSettingStore } from '@/store/setting';
import { useAuthActions } from '@/store/user';

import { useStyles } from './style';

const CustomServer = () => {
  const { t } = useTranslation(['setting', 'common']);
  const { styles } = useStyles();
  const { customServerUrl, setCustomServerUrl } = useSettingStore();
  const { logout } = useAuthActions();
  const router = useRouter();
  const [form] = Form.useForm();

  const currentServer = customServerUrl ?? DEFAULT_SERVER_URL;

  useEffect(() => {
    void form.setFieldsValue(
      { customServer: customServerUrl ?? '' },
      { markTouched: false, validate: false },
    );
  }, [customServerUrl, form]);

  const confirmServerSwitch = useCallback(
    (onConfirm: () => void) => {
      RNAlert.alert(
        t('developer.customServer.confirmTitle', { ns: 'setting' }),
        t('developer.customServer.confirmDescription', { ns: 'setting' }),
        [
          {
            style: 'cancel',
            text: t('actions.cancel', { ns: 'common' }),
          },
          {
            onPress: onConfirm,
            text: t('actions.confirm', { ns: 'common' }),
          },
        ],
      );
    },
    [t],
  );

  const finalizeCustomServer = useCallback(
    async (nextValue: string | null, options?: { resetFieldToDefault?: boolean }) => {
      try {
        setCustomServerUrl(nextValue);

        if (options?.resetFieldToDefault) {
          await form.setFieldsValue(
            { customServer: DEFAULT_SERVER_URL },
            { markTouched: false, validate: false },
          );
        }

        await sleep(500);
        await logout();
        safeReplaceLogin(router);

        const messageKey = nextValue
          ? 'developer.customServer.updated'
          : 'developer.customServer.resetSuccess';

        Toast.success(t(messageKey, { ns: 'setting' }));
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        Toast.error(`${t('developer.failurePrefix', { ns: 'setting' })}${message}`);
      }
    },
    [form, logout, router, setCustomServerUrl, t],
  );

  const applyCustomServer = async () => {
    try {
      const values = await form.validateFields(['customServer']);
      const rawValue = (values.customServer as string | undefined) ?? '';
      const trimmed = rawValue.trim();
      const nextValue = trimmed ? formatServerUrl(trimmed) : null;
      const nextServer = nextValue ?? DEFAULT_SERVER_URL;

      if (nextServer === currentServer) {
        Toast.success(
          t(nextValue ? 'developer.customServer.updated' : 'developer.customServer.resetSuccess', {
            ns: 'setting',
          }),
        );
        return;
      }

      confirmServerSwitch(() => {
        void finalizeCustomServer(nextValue);
      });
    } catch {
      // Validation errors are surfaced via the form.
    }
  };

  const resetCustomServer = async () => {
    if (currentServer === DEFAULT_SERVER_URL) {
      Toast.success(t('developer.customServer.resetSuccess', { ns: 'setting' }));
      return;
    }

    confirmServerSwitch(() => {
      void finalizeCustomServer(null, { resetFieldToDefault: true });
    });
  };

  return (
    <View style={styles.container}>
      <Notice
        description={t('developer.customServer.notice', { ns: 'setting' })}
        message={t('developer.customServer.noticeTitle', { ns: 'setting' })}
        type="info"
      />
      <Form form={form} initialValues={{ customServer: currentServer }}>
        <Form.Item
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
            variant="outlined"
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
    </View>
  );
};

export default CustomServer;
