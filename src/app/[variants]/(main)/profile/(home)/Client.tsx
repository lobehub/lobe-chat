'use client';

import { CopyButton, Form, type FormGroupItemType, Input } from '@lobehub/ui';
import { Skeleton } from 'antd';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { enableAuth } from '@/const/auth';
import { FORM_STYLE } from '@/const/layoutTokens';
import AvatarWithUpload from '@/features/AvatarWithUpload';
import UserAvatar from '@/features/User/UserAvatar';
import { useUserStore } from '@/store/user';
import { authSelectors, userProfileSelectors } from '@/store/user/selectors';

import SSOProvidersList from './features/SSOProvidersList';

const Client = memo<{ mobile?: boolean }>(({ mobile }) => {
  const [isLoginWithNextAuth, isLoginWithBetterAuth, isLogin] = useUserStore((s) => [
    authSelectors.isLoginWithNextAuth(s),
    authSelectors.isLoginWithBetterAuth(s),
    authSelectors.isLogin(s),
  ]);
  const [username, fullName, userProfile, loading] = useUserStore((s) => [
    userProfileSelectors.username(s),
    userProfileSelectors.fullName(s),
    userProfileSelectors.userProfile(s),
    !s.isLoaded,
  ]);

  const isLoginWithAuth = isLoginWithNextAuth || isLoginWithBetterAuth;

  const [form] = Form.useForm();
  const { t } = useTranslation('auth');

  if (loading)
    return (
      <Skeleton
        active
        paragraph={{ rows: 6 }}
        style={{ padding: mobile ? 16 : undefined }}
        title={false}
      />
    );

  const profile: FormGroupItemType = {
    children: [
      {
        children: enableAuth && !isLogin ? <UserAvatar /> : <AvatarWithUpload />,
        label: t('profile.avatar'),
        layout: 'horizontal',
        minWidth: undefined,
      },
      {
        children: username || '--',
        label: t('profile.username'),
      },
      {
        children: <Input disabled />,
        label: t('profile.fullName'),
        name: 'fullName',
      },
      {
        children: (
          <Flexbox align="center" gap={8} horizontal>
            {userProfile?.email}
            <CopyButton content={userProfile?.email || ''} size="small" />
          </Flexbox>
        ),
        hidden: !isLoginWithAuth || !userProfile?.email,
        label: t('profile.email'),
      },
      {
        children: <SSOProvidersList />,
        hidden: !isLoginWithAuth,
        label: t('profile.sso.providers'),
        layout: 'vertical',
        minWidth: undefined,
      },
    ],
    title: t('tab.profile'),
  };
  return (
    <Form
      form={form}
      initialValues={{
        fullName: fullName || '--',
      }}
      items={[profile]}
      itemsType={'group'}
      variant={'borderless'}
      {...FORM_STYLE}
    />
  );
});

export default Client;
