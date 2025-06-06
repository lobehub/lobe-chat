import { t } from 'i18next';

import { enableAuth, enableClerk, enableNextAuth } from '@/const/auth';
import { BRANDING_NAME } from '@/const/branding';
import { isDesktop } from '@/const/version';
import { UserStore } from '@/store/user';
import { LobeUser } from '@/types/user';

const DEFAULT_USERNAME = BRANDING_NAME;

const nickName = (s: UserStore) => {
  const defaultNickName = s.user?.fullName || s.user?.username;
  if (!enableAuth) {
    if (isDesktop) {
      return defaultNickName;
    }
    return t('userPanel.defaultNickname', { ns: 'common' });
  }

  if (s.isSignedIn) return defaultNickName;

  return t('userPanel.anonymousNickName', { ns: 'common' });
};

const username = (s: UserStore) => {
  if (!enableAuth) {
    if (isDesktop) {
      return s.user?.username;
    }
    return DEFAULT_USERNAME;
  }

  if (s.isSignedIn) return s.user?.username;

  return 'anonymous';
};

export const userProfileSelectors = {
  fullName: (s: UserStore): string => s.user?.fullName || '',
  nickName,
  userAvatar: (s: UserStore): string => s.user?.avatar || '',
  userId: (s: UserStore) => s.user?.id,
  userProfile: (s: UserStore): LobeUser | null | undefined => s.user,
  username,
};

/**
 * 使用此方法可以兼容不需要登录鉴权的情况
 */
const isLogin = (s: UserStore) => {
  // 如果没有开启鉴权，说明不需要登录，默认是登录态
  if (!enableAuth) return true;

  return s.isSignedIn;
};

export const authSelectors = {
  isLoaded: (s: UserStore) => s.isLoaded,
  isLogin,
  isLoginWithAuth: (s: UserStore) => s.isSignedIn,
  isLoginWithClerk: (s: UserStore): boolean => (s.isSignedIn && enableClerk) || false,
  isLoginWithNextAuth: (s: UserStore): boolean => (s.isSignedIn && !!enableNextAuth) || false,
};
