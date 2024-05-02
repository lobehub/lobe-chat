'use client';

import { SiWebrtc } from '@icons-pack/react-simple-icons';
import { Form, type ItemGroup, Tooltip } from '@lobehub/ui';
import { Form as AntForm, Input, Switch, Typography } from 'antd';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { FORM_STYLE } from '@/const/layoutTokens';
import SyncStatusInspector from '@/features/SyncStatusInspector';
import { useUserStore } from '@/store/user';

import { useSyncSettings } from '../../hooks/useSyncSettings';
import ChannelNameInput from './ChannelNameInput';

type SettingItemGroup = ItemGroup;

const WebRTC = memo(() => {
  const { t } = useTranslation('setting');
  const [form] = AntForm.useForm();

  const [setSettings] = useUserStore((s) => [s.setSettings]);

  useSyncSettings(form);

  const channelName = AntForm.useWatch(['sync', 'webrtc', 'channelName'], form);

  const config: SettingItemGroup = {
    children: [
      {
        children: <ChannelNameInput form={form} />,
        desc: t('sync.webrtc.channelName.desc'),
        label: t('sync.webrtc.channelName.title'),
        name: ['sync', 'webrtc', 'channelName'],
      },
      {
        children: (
          <Input.Password
            autoComplete={'nw-password'}
            placeholder={t('sync.webrtc.channelPassword.placeholder')}
          />
        ),
        desc: t('sync.webrtc.channelPassword.desc'),
        label: t('sync.webrtc.channelPassword.title'),
        name: ['sync', 'webrtc', 'channelPassword'],
      },
      {
        children: !channelName ? (
          <Tooltip title={t('sync.webrtc.enabled.invalid')}>
            <Switch disabled />
          </Tooltip>
        ) : (
          <Switch />
          // <SyncSwitch />
        ),

        label: t('sync.webrtc.enabled.title'),
        minWidth: undefined,
        name: ['sync', 'webrtc', 'enabled'],
      },
    ],
    extra: (
      <div
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <SyncStatusInspector hiddenActions hiddenEnableGuide />
      </div>
    ),
    title: (
      <Flexbox gap={8} horizontal>
        {/* @ts-ignore */}
        <SiWebrtc />
        <Flexbox align={'baseline'} gap={8} horizontal>
          {t('sync.webrtc.title')}
          <Typography.Text style={{ fontWeight: 'normal' }} type={'secondary'}>
            {t('sync.webrtc.desc')}
          </Typography.Text>
        </Flexbox>
      </Flexbox>
    ),
  };

  return (
    <Form
      form={form}
      items={[config]}
      onFinish={setSettings}
      onValuesChange={setSettings}
      {...FORM_STYLE}
    />
  );
});

export default WebRTC;
