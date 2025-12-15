import { enableBetterAuth, enableNextAuth } from '@lobechat/const';
import { useRouter } from 'next/navigation';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';
import { Link } from 'react-router-dom';

import BrandWatermark from '@/components/BrandWatermark';
import Menu from '@/components/Menu';
import { isDesktop } from '@/const/version';
import { useUserStore } from '@/store/user';
import { authSelectors } from '@/store/user/selectors';

import DataStatistics from '../DataStatistics';
import UserInfo from '../UserInfo';
import UserLoginOrSignup from '../UserLoginOrSignup';
import LangButton from './LangButton';
import { useMenu } from './useMenu';

const PanelContent = memo<{ closePopover: () => void }>(({ closePopover }) => {
  const router = useRouter();
  const isLoginWithAuth = useUserStore(authSelectors.isLoginWithAuth);
  const [openSignIn, signOut] = useUserStore((s) => [s.openLogin, s.logout]);
  const { mainItems, logoutItems } = useMenu();

  const handleSignIn = () => {
    openSignIn();
    closePopover();
  };

  const handleSignOut = () => {
    signOut();
    closePopover();
    // NextAuth and Better Auth handle redirect in their own signOut methods
    if (enableNextAuth || enableBetterAuth) return;
    // Clerk uses /login page
    router.push('/login');
  };

  return (
    <Flexbox gap={2} style={{ minWidth: 300 }}>
      {isDesktop || isLoginWithAuth ? (
        <>
          <UserInfo avatarProps={{ clickable: false }} />

          <Link style={{ color: 'inherit' }} to={'/settings?active=stats'}>
            <DataStatistics />
          </Link>
        </>
      ) : (
        <UserLoginOrSignup onClick={handleSignIn} />
      )}

      <Menu items={mainItems} onClick={closePopover} />
      {isLoginWithAuth && <Menu items={logoutItems} onClick={handleSignOut} />}
      <Flexbox gap={4} horizontal justify={'space-between'} style={{ padding: '6px 8px 6px 16px' }}>
        <BrandWatermark />
        <LangButton placement={'right'} />
      </Flexbox>
    </Flexbox>
  );
});

export default PanelContent;
