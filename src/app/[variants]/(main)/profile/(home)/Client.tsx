'use client';

import { Form, type FormGroupItemType, Input } from '@lobehub/ui';
import { Button, Skeleton } from 'antd';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { enableAuth } from '@/const/auth';
import { FORM_STYLE } from '@/const/layoutTokens';
import AvatarWithUpload from '@/features/AvatarWithUpload';
import UserAvatar from '@/features/User/UserAvatar';
import { useUserStore } from '@/store/user';
import { authSelectors, userProfileSelectors } from '@/store/user/selectors';
import { handleAccountDeleted } from '@/utils/account';

import DeleteAccountModal from '../features/DeleteAccountModal';
import SSOProvidersList from './features/SSOProvidersList';

const handleDeleteAccountConfirm = async () => await handleAccountDeleted();

const Client = memo<{ mobile?: boolean }>(({ mobile }) => {
  const [isLoginWithNextAuth, isLogin] = useUserStore((s) => [
    authSelectors.isLoginWithNextAuth(s),
    authSelectors.isLogin(s),
  ]);
  const [nickname, username, userProfile, loading] = useUserStore((s) => [
    userProfileSelectors.nickName(s),
    userProfileSelectors.username(s),
    userProfileSelectors.userProfile(s),
    !s.isLoaded,
  ]);

  const [form] = Form.useForm();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
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
        children: <Input disabled />,
        label: t('profile.username'),
        name: 'username',
      },
      {
        children: <Input disabled />,
        hidden: !isLoginWithNextAuth || !userProfile?.email,
        label: t('profile.email'),
        name: 'email',
      },
      {
        children: <SSOProvidersList />,
        hidden: !isLoginWithNextAuth,
        label: t('profile.sso.providers'),
        layout: 'vertical',
        minWidth: undefined,
      },
    ],
    title: t('tab.profile'),
  };

  const dangerZone: FormGroupItemType = {
    children: [
      {
        children: (
          <Button
            danger
            onClick={() => setShowDeleteModal(true)}
            style={{ marginTop: 16 }}
            type="primary"
          >
            删除账户
          </Button>
        ),
        label: '危险操作',
        layout: 'vertical',
        minWidth: undefined,
      },
    ],
    title: '账户管理',
  };

  return (
    <>
      <Form
        form={form}
        initialValues={{
          email: userProfile?.email || '--',
          username: nickname || username,
        }}
        items={[profile, dangerZone]}
        itemsType={'group'}
        variant={'borderless'}
        {...FORM_STYLE}
      />

      <DeleteAccountModal
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteAccountConfirm}
        open={showDeleteModal}
      />
    </>
  );
});

export default Client;
