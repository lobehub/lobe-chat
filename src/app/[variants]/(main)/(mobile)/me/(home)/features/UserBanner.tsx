'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { isDeprecatedEdition } from '@/const/version';
import DataStatistics from '@/features/User/DataStatistics';
import UserInfo from '@/features/User/UserInfo';
import UserLoginOrSignup from '@/features/User/UserLoginOrSignup/Community';
import { useUserStore } from '@/store/user';
import { authSelectors } from '@/store/user/selectors';

const UserBanner = memo(() => {
  const router = useRouter();
  const isLoginWithAuth = useUserStore(authSelectors.isLoginWithAuth);
  const [enableAuth, signIn, enabledNextAuth] = useUserStore((s) => [
    authSelectors.enabledAuth(s),
    s.openLogin,
    authSelectors.enabledNextAuth(s),
  ]);

  return (
    <Flexbox gap={12} paddingBlock={8}>
      {!enableAuth || (enableAuth && isLoginWithAuth) ? (
        <>
          <Link href={'/profile'} style={{ color: 'inherit' }}>
            <UserInfo />
          </Link>
          {!isDeprecatedEdition && (
            <Link href={'/profile/stats'} style={{ color: 'inherit' }}>
              <DataStatistics paddingInline={12} />
            </Link>
          )}
        </>
      ) : (
        <UserLoginOrSignup
          onClick={() => {
            // If use NextAuth, call openLogin method directly
            if (enabledNextAuth) {
              signIn();
              return;
            }
            router.push('/login');
          }}
        />
      )}
    </Flexbox>
  );
});

export default UserBanner;
