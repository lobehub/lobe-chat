'use client';

import { useRouter } from 'next/navigation';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { enableAuth } from '@/const/auth';
import DataStatistics from '@/features/User/DataStatistics';
import UserInfo from '@/features/User/UserInfo';
import UserLoginOrSignup from '@/features/User/UserLoginOrSignup';
import { useUserStore } from '@/store/user';
import { authSelectors } from '@/store/user/selectors';

const UserBanner = memo(() => {
  const router = useRouter();
  const isLoginWithAuth = useUserStore(authSelectors.isLoginWithAuth);

  return (
    <Flexbox gap={12} paddingBlock={8}>
      {!enableAuth ? (
        <>
          <UserInfo />
          <DataStatistics paddingInline={12} />
        </>
      ) : isLoginWithAuth ? (
        <>
          <UserInfo onClick={() => router.push('/me/profile')} />
          <DataStatistics paddingInline={12} />
        </>
      ) : (
        <UserLoginOrSignup onClick={() => router.push('/login')} />
      )}
    </Flexbox>
  );
});

export default UserBanner;
