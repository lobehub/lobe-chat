'use client';

import { NetworkProxySettings } from '@lobechat/electron-client-ipc';
import { Button, Form, Input, Radio, Skeleton, Space, Switch, message } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { desktopSettingsService } from '@/services/electron/settings';
import { useElectronStore } from '@/store/electron';

const ProxyForm = () => {
  const { t } = useTranslation('electron');
  const [form] = Form.useForm();
  const [testUrl, setTestUrl] = useState('https://www.google.com');
  const [isTesting, setIsTesting] = useState(false);

  const [setProxySettings, useGetProxySettings] = useElectronStore((s) => [
    s.setProxySettings,
    s.useGetProxySettings,
  ]);
  const { data: proxySettings, isLoading } = useGetProxySettings();

  useEffect(() => {
    if (proxySettings) {
      form.setFieldsValue(proxySettings);
    }
  }, [form, proxySettings]);

  const handleValuesChange = useCallback((changedValues: Partial<NetworkProxySettings>) => {
    setProxySettings(changedValues);
  }, []);

  if (isLoading) return <Skeleton />;

  return (
    <Form disabled={isLoading} form={form} layout="vertical" onValuesChange={handleValuesChange}>
      <Form.Item label={t('proxy.enable')} name="enableProxy" valuePropName="checked">
        <Switch />
      </Form.Item>
      <Form.Item dependencies={['enableProxy']} label={t('proxy.type')} name="proxyType">
        <Radio.Group disabled={!form.getFieldValue('enableProxy')}>
          <Radio value="http">HTTP</Radio>
          <Radio value="https">HTTPS</Radio>
          <Radio value="socks5">SOCKS5</Radio>
        </Radio.Group>
      </Form.Item>
      <Form.Item dependencies={['enableProxy']} label={t('proxy.server')} name="proxyServer">
        <Input disabled={!form.getFieldValue('enableProxy')} placeholder="127.0.0.1" />
      </Form.Item>
      <Form.Item dependencies={['enableProxy']} label={t('proxy.port')} name="proxyPort">
        <Input disabled={!form.getFieldValue('enableProxy')} placeholder="7890" />
      </Form.Item>
      <Form.Item
        dependencies={['enableProxy']}
        label={t('proxy.auth')}
        name="proxyRequireAuth"
        valuePropName="checked"
      >
        <Switch disabled={!form.getFieldValue('enableProxy')} />
      </Form.Item>
      <Form.Item
        dependencies={['proxyRequireAuth', 'enableProxy']}
        hidden={!form.getFieldValue('proxyRequireAuth') || !form.getFieldValue('enableProxy')}
        label={t('proxy.username')}
        name="proxyUsername"
      >
        <Input placeholder={t('proxy.username_placeholder')} />
      </Form.Item>
      <Form.Item
        dependencies={['proxyRequireAuth', 'enableProxy']}
        hidden={!form.getFieldValue('proxyRequireAuth') || !form.getFieldValue('enableProxy')}
        label={t('proxy.password')}
        name="proxyPassword"
      >
        <Input.Password placeholder={t('proxy.password_placeholder')} />
      </Form.Item>
      {/*<Form.Item dependencies={['enableProxy']} label={t('proxy.bypass')} name="proxyBypass">*/}
      {/*  <Input.TextArea*/}
      {/*    disabled={!form.getFieldValue('enableProxy')}*/}
      {/*    placeholder="localhost, 127.0.0.1, ::1"*/}
      {/*  />*/}
      {/*</Form.Item>*/}

      <Form.Item label={t('proxy.testUrl')}>
        <Space.Compact style={{ width: '100%' }}>
          <Input
            onChange={(e) => setTestUrl(e.target.value)}
            placeholder={t('proxy.testUrlPlaceholder')}
            value={testUrl}
          />
          <Button
            loading={isTesting}
            onClick={async () => {
              setIsTesting(true);
              try {
                // 使用服务方法测试连接
                await desktopSettingsService.testProxyConnection(testUrl);
                message.success(t('proxy.testSuccess'));
              } catch (error) {
                message.error(t('proxy.testFailed', { error: (error as Error).message }));
              } finally {
                setIsTesting(false);
              }
            }}
            type="primary"
          >
            {t('proxy.testButton')}
          </Button>
        </Space.Compact>
      </Form.Item>
    </Form>
  );
};

export default ProxyForm;
