'use client';

import { SiWebrtc } from '@icons-pack/react-simple-icons';
import { Form, type ItemGroup, Tooltip } from '@lobehub/ui';
import { Form as AntForm, Input, Switch, Typography } from 'antd';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useSyncSettings } from '@/app/[variants]/(main)/settings/hooks/useSyncSettings';
import { FORM_STYLE } from '@/const/layoutTokens';
import SyncStatusInspector from '@/features/SyncStatusInspector';
import { useUserStore } from '@/store/user';

import ChannelNameInput from './ChannelNameInput';

type SettingItemGroup = ItemGroup;

const WebRTC = memo(() => {
  const { t } = useTranslation('setting');
  const [form] = Form.useForm();

  const [setSettings] = useUserStore((s) => [s.setSettings]);

  useSyncSettings(form);

  const channelName = AntForm.useWatch(['sync', 'webrtc', 'channelName'], form);
  const signaling = AntForm.useWatch(['sync', 'webrtc', 'signaling'], form);

  const config: SettingItemGroup = {
    children: [
      {
        children: <Input placeholder={t('sync.webrtc.signaling.placeholder')} />,
        desc: t('sync.webrtc.signaling.desc'),
        label: t('sync.webrtc.signaling.title'),
        name: ['sync', 'webrtc', 'signaling'],
      },
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
        children:
          !channelName || !signaling ? (
            <Tooltip title={t('sync.webrtc.enabled.invalid')}>
              <Switch disabled />
            </Tooltip>
          ) : (
            <Switch />
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
      <Flexbox align={'center'} gap={12} horizontal wrap={'wrap'}>
        <Flexbox align={'center'} gap={8} horizontal>
          <SiWebrtc style={{ flex: 'none' }} />
          {t('sync.webrtc.title')}
        </Flexbox>
        <Typography.Text style={{ fontWeight: 'normal' }} type={'secondary'}>
          {t('sync.webrtc.desc')}
        </Typography.Text>
      </Flexbox>
    ),
  };

  return (
    <Form
      form={form}
      items={[config]}
      itemsType={'group'}
      onFinish={setSettings}
      onValuesChange={setSettings}
      variant={'pure'}
      {...FORM_STYLE}
    />
  );
});

export default WebRTC;
