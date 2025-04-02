'use client';

import { ChartColumnBigIcon, LogOut, ShieldCheck, UserCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import Cell, { CellProps } from '@/components/Cell';
import { enableAuth } from '@/const/auth';
import { isDeprecatedEdition } from '@/const/version';
import { ProfileTabs } from '@/store/global/initialState';
import { useUserStore } from '@/store/user';
import { authSelectors } from '@/store/user/selectors';

const Category = memo(() => {
  const [isLogin, isLoginWithClerk, signOut] = useUserStore((s) => [
    authSelectors.isLogin(s),
    authSelectors.isLoginWithClerk(s),
    s.logout,
  ]);
  const router = useRouter();
  const { t } = useTranslation('auth');
  const items: CellProps[] = [
    {
      icon: UserCircle,
      key: ProfileTabs.Profile,
      label: t('tab.profile'),
      onClick: () => router.push('/profile'),
    },
    enableAuth &&
      isLoginWithClerk && {
        icon: ShieldCheck,
        key: ProfileTabs.Security,
        label: t('tab.security'),
        onClick: () => router.push('/profile/security'),
      },
    !isDeprecatedEdition && {
      icon: ChartColumnBigIcon,
      key: ProfileTabs.Stats,
      label: t('tab.stats'),
      onClick: () => router.push('/profile/stats'),
    },
    enableAuth &&
      isLogin && {
        type: 'divider',
      },
    enableAuth &&
      isLogin && {
        icon: LogOut,
        key: 'logout',
        label: t('signout', { ns: 'auth' }),
        onClick: () => {
          signOut();
          router.push('/login');
        },
      },
  ].filter(Boolean) as CellProps[];

  return items?.map(({ key, ...item }, index) => <Cell key={key || index} {...item} />);
});

export default Category;
