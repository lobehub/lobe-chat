'use client';

import { Form, type ItemGroup } from '@lobehub/ui';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { FORM_STYLE } from '@/const/layoutTokens';
import AvatarWithUpload from '@/features/AvatarWithUpload';
import UserAvatar from '@/features/User/UserAvatar';
import { useUserStore } from '@/store/user';
import { authSelectors, userProfileSelectors } from '@/store/user/selectors';

type SettingItemGroup = ItemGroup;

const Client = memo<{ mobile?: boolean }>(() => {
  const [isLoginWithNextAuth] = useUserStore((s) => [authSelectors.isLoginWithNextAuth(s)]);
  const [enableAuth, nickname, username, userProfile] = useUserStore((s) => [
    s.enableAuth(),
    userProfileSelectors.nickName(s),
    userProfileSelectors.username(s),
    userProfileSelectors.userProfile(s),
  ]);

  const [form] = Form.useForm();
  const { t } = useTranslation('auth');

  const profile: SettingItemGroup = {
    children: [
      {
        children: enableAuth && isLoginWithNextAuth ? <UserAvatar /> : <AvatarWithUpload />,
        label: t('profile.avatar'),
        minWidth: undefined,
      },
      {
        children: nickname || username,
        label: t('profile.username'),
        minWidth: undefined,
      },
      {
        children: userProfile?.email || '--',
        hidden: !isLoginWithNextAuth || !userProfile?.email,
        label: t('profile.email'),
        minWidth: undefined,
      },
    ],
    title: t('tab.profile'),
  };
  return (
    <Form form={form} items={[profile]} itemsType={'group'} variant={'pure'} {...FORM_STYLE} />
  );
});

export default Client;
