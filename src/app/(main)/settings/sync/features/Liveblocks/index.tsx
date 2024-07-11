'use client';

import { Alert, Form, type ItemGroup, Tooltip } from '@lobehub/ui';
import { Form as AntForm, Input, Switch, Typography } from 'antd';
import { memo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useSyncSettings } from '@/app/(main)/settings/hooks/useSyncSettings';
import { FORM_STYLE } from '@/const/layoutTokens';
import SyncStatusTag from '@/features/SyncStatusInspector/Tag';
import { useServerConfigStore } from '@/store/serverConfig';
import { serverConfigSelectors } from '@/store/serverConfig/selectors';
import { useUserStore } from '@/store/user';
import {
  authSelectors,
  keyVaultsConfigSelectors,
  syncSettingsSelectors,
  userProfileSelectors,
} from '@/store/user/selectors';
import { SyncMethod } from '@/types/sync';

import LiveblocksIcon from './LiveblocksIcon';
import RoomNameInput from './RoomNameInput';

type SettingItemGroup = ItemGroup;

const Liveblocks = memo(() => {
  const { t } = useTranslation('setting');
  const [form] = Form.useForm();

  const [enabledAccessCode, enabledLiveblocks] = useServerConfigStore((s) => [
    serverConfigSelectors.enabledAccessCode(s),
    serverConfigSelectors.enabledLiveblockSync(s),
  ]);

  const [
    customName,
    customApiKey,
    isAccessCodeFilled,
    isLoginWithAuth,
    userId,
    profile,
    enableAuth,
    setSettings,
  ] = useUserStore((s) => [
    syncSettingsSelectors.liveblocksConfig(s).customName,
    syncSettingsSelectors.liveblocksConfig(s).customApiKey,
    !!keyVaultsConfigSelectors.password(s),
    authSelectors.isLoginWithAuth(s),
    userProfileSelectors.userId(s),
    userProfileSelectors.userProfile(s),
    s.enableAuth(),
    s.setSettings,
  ]);

  useSyncSettings(form);

  const roomName = AntForm.useWatch(['sync', 'liveblocks', 'roomName'], form);

  useEffect(() => {
    // Fix for the first time setting up
    if (!customName) {
      form.setFieldValue(['sync', 'liveblocks', 'roomName'], userId);
      form.submit();
    }
    console.log(profile);
  }, [userId]);

  const config: SettingItemGroup = {
    children: [
      {
        children: (
          <Switch
            onChange={(checked) => {
              form.setFieldValue(['sync', 'liveblocks', 'roomName'], checked ? '' : userId);
              form.setFieldValue(['sync', 'liveblocks', 'enabled'], false);
              form.submit();
            }}
          />
        ),
        desc: t('sync.liveblocks.customName.desc'),
        hidden: !enableAuth || (enableAuth && !isLoginWithAuth),
        label: t('sync.liveblocks.customName.title'),
        minWidth: undefined,
        name: ['sync', 'liveblocks', 'customName'],
      },
      {
        children:
          enableAuth && !customName && isLoginWithAuth ? (
            <Input defaultValue={userId} disabled />
          ) : (
            <RoomNameInput form={form} />
          ),
        desc: t('sync.liveblocks.roomName.desc'),
        // hidden: enableAuth && !customName,
        label: t('sync.liveblocks.roomName.title'),
        name: ['sync', 'liveblocks', 'roomName'],
      },
      {
        children: (
          <Input.Password
            autoComplete={'nw-password'}
            placeholder={t('sync.liveblocks.roomPassword.placeholder')}
          />
        ),
        desc: t('sync.liveblocks.roomPassword.desc'),
        label: t('sync.liveblocks.roomPassword.title'),
        name: ['sync', 'liveblocks', 'roomPassword'],
      },
      {
        children: (
          <Switch
            onChange={(checked) => {
              form.setFieldValue(['sync', 'liveblocks', 'customApiKey'], checked);
              form.setFieldValue(['sync', 'liveblocks', 'publicApiKey'], '');
              form.setFieldValue(['sync', 'liveblocks', 'enabled'], false);
              form.submit();
            }}
          />
        ),
        desc: t('sync.liveblocks.customApiKey.desc'),
        hidden: !enabledLiveblocks,
        label: t('sync.liveblocks.customApiKey.title'),
        minWidth: undefined,
        name: ['sync', 'liveblocks', 'customApiKey'],
      },
      {
        children: <Input placeholder={t('sync.liveblocks.publicApiKey.placeholder')} />,
        desc: t('sync.liveblocks.publicApiKey.desc'),
        hidden: !customApiKey && enabledLiveblocks,
        label: t('sync.liveblocks.publicApiKey.title'),
        name: ['sync', 'liveblocks', 'publicApiKey'],
      },
      {
        children: !roomName ? (
          <Tooltip title={t('sync.liveblocks.enabled.invalid')}>
            <Switch disabled />
          </Tooltip>
        ) : (
          <Switch />
          // <SyncSwitch />
        ),

        label: t('sync.liveblocks.enabled.title'),
        minWidth: undefined,
        name: ['sync', 'liveblocks', 'enabled'],
      },
      {
        hidden: isLoginWithAuth || (enabledAccessCode && isAccessCodeFilled) || !enabledLiveblocks,
        label: enableAuth ? (
          <Alert
            closable
            colorfulText
            message={t('sync.liveblocks.warning.authRequired')}
            type="warning"
          />
        ) : (
          <Alert
            closable
            colorfulText
            message={t('sync.liveblocks.warning.accessCodeRequired')}
            type="warning"
          />
        ),
        labelCol: { span: 24 },
        wrapperCol: { span: 0 },
      },
      {
        hidden: enabledLiveblocks,
        label: (
          <Alert
            closable
            colorfulText
            message={t('sync.liveblocks.warning.keyRequired')}
            type="warning"
          />
        ),
        labelCol: { span: 24 },
        wrapperCol: { span: 0 },
      },
    ],
    extra: (
      <div
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <SyncStatusTag hiddenActions hiddenEnableGuide hiddenName method={SyncMethod.Liveblocks} />
      </div>
    ),
    title: (
      <Flexbox align={'center'} gap={12} horizontal wrap={'wrap'}>
        <Flexbox align={'center'} gap={8} horizontal>
          <LiveblocksIcon style={{ flex: 'none' }} />
          {t('sync.liveblocks.title')}
        </Flexbox>
        <Typography.Text style={{ fontWeight: 'normal' }} type={'secondary'}>
          {t('sync.liveblocks.desc')}
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

export default Liveblocks;
