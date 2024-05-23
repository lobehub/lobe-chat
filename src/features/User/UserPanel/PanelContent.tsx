import { useRouter } from 'next/navigation';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import BrandWatermark from '@/components/BrandWatermark';
import Menu from '@/components/Menu';
import { useUserStore } from '@/store/user';
import { authSelectors } from '@/store/user/selectors';

import DataStatistics from '../DataStatistics';
import UserInfo from '../UserInfo';
import UserLoginOrSignup from '../UserLoginOrSignup';
import LangButton from './LangButton';
import ThemeButton from './ThemeButton';
import { useMenu } from './useMenu';

const PanelContent = memo<{ closePopover: () => void }>(({ closePopover }) => {
  const router = useRouter();
  const isLoginWithAuth = useUserStore(authSelectors.isLoginWithAuth);
  const [openSignIn, signOut, openUserProfile, enableAuth, enabledNextAuth] = useUserStore((s) => [
    s.openLogin,
    s.logout,
    s.openUserProfile,
    s.enableAuth(),
    s.enabledNextAuth,
  ]);
  const { mainItems, logoutItems } = useMenu();

  const handleOpenProfile = () => {
    if (!enableAuth) return;
    openUserProfile();
    closePopover();
  };

  const handleSignIn = () => {
    openSignIn();
    closePopover();
  };

  const handleSignOut = () => {
    signOut();
    closePopover();
    // NextAuth doesn't need to redirect to login page
    if (enabledNextAuth) return;
    router.push('/login');
  };

  return (
    <Flexbox gap={2} style={{ minWidth: 300 }}>
      {!enableAuth ? (
        <>
          <UserInfo />
          <DataStatistics />
        </>
      ) : isLoginWithAuth ? (
        <>
          <UserInfo onClick={handleOpenProfile} />
          <DataStatistics />
        </>
      ) : (
        <UserLoginOrSignup onClick={handleSignIn} />
      )}

      <Menu items={mainItems} onClick={closePopover} />
      <Flexbox
        align={'center'}
        horizontal
        justify={'space-between'}
        style={isLoginWithAuth ? { paddingRight: 6 } : { padding: '6px 6px 6px 16px' }}
      >
        {isLoginWithAuth ? (
          <Menu items={logoutItems} onClick={handleSignOut} />
        ) : (
          <BrandWatermark />
        )}
        <Flexbox align={'center'} flex={'none'} gap={6} horizontal>
          <LangButton />
          <ThemeButton />
        </Flexbox>
      </Flexbox>
    </Flexbox>
  );
});

export default PanelContent;
