import { Token } from '@/_types/user';
import i18n from '@/i18n';
import { TokenStorage } from '@/services/_auth/tokenStorage';
import { useUserStore } from '@/store/user';

const updateToken = async (mutate: (token: Token) => Token): Promise<void> => {
  const current = await TokenStorage.getToken();
  if (!current) throw new Error(i18n.t('developer.auth.error.noToken', { ns: 'setting' }));
  const next = mutate(current);
  await TokenStorage.storeToken(next);
};

export const expireAccessTokenNow = async (): Promise<void> => {
  const now = Math.floor(Date.now() / 1000) - 10;
  await updateToken((t) => ({ ...t, expiresAt: now }));
};

export const expireRefreshTokenNow = async (): Promise<void> => {
  const now = Math.floor(Date.now() / 1000) - 10;
  await updateToken((t) => ({ ...t, refreshExpiresAt: now }));
};

export const invalidateAccessToken = async (): Promise<void> => {
  await updateToken((t) => ({ ...t, accessToken: 'invalid-access-token' }));
};

export const invalidateRefreshToken = async (): Promise<void> => {
  await updateToken((t) => ({ ...t, refreshToken: 'invalid-refresh-token' }));
};

export const clearAuthData = async (): Promise<void> => {
  await TokenStorage.clearAll();
  useUserStore.getState().clearAuthState();
};
