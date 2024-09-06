'use client';

import { LogOut, ShieldCheck, UserCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import Cell, { CellProps } from '@/components/Cell';
import { useUserStore } from '@/store/user';

const Category = memo(() => {
  const router = useRouter();
  const { t } = useTranslation('auth');
  const signOut = useUserStore((s) => s.logout);
  const items: CellProps[] = [
    {
      icon: UserCircle,
      key: 'profile',
      label: t('profile'),
      onClick: () => router.push('/profile'),
    },
    {
      icon: ShieldCheck,
      key: 'security',
      label: t('security'),
      onClick: () => router.push('/profile/security'),
    },
    {
      type: 'divider',
    },
    {
      icon: LogOut,
      key: 'logout',
      label: t('signout', { ns: 'auth' }),
      onClick: () => {
        signOut();
        router.push('/login');
      },
    },
  ];

  return items?.map((item, index) => <Cell key={item.key || index} {...item} />);
});

export default Category;
