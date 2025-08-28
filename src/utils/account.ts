import { enableClerk } from '@/const/auth';

export const clearAccountData = () => {
  if (typeof window === 'undefined') return;

  // Clear localStorage
  localStorage.clear();

  // Clear sessionStorage
  sessionStorage.clear();

  // Clear cookies
  document.cookie.split(";").forEach((c) => {
    const eqPos = c.indexOf("=");
    const name = eqPos > -1 ? c.slice(0, eqPos).trim() : c.trim();
    const expires = "expires=Thu, 01 Jan 1970 00:00:00 GMT";
    const path = "path=/";
    const domain1 = `domain=${window.location.hostname}`;
    const domain2 = `domain=.${window.location.hostname}`;

    // Clear cookie for current domain
    if (document && document.cookie) {
      // eslint-disable-next-line unicorn/no-document-cookie
      document.cookie = `${name}=;${expires};${path}`;
      // eslint-disable-next-line unicorn/no-document-cookie
      document.cookie = `${name}=;${expires};${path};${domain1}`;
      // eslint-disable-next-line unicorn/no-document-cookie
      document.cookie = `${name}=;${expires};${path};${domain2}`;
    }
  });
};

export const handleAccountDeleted = async () => {
  // Clear all browser data
  clearAccountData();

  // For Clerk users, also sign out
  // @ts-ignore
  if (enableClerk && typeof window.Clerk !== 'undefined') {
    try {
      // @ts-ignore
      await window.Clerk.signOut();
    } catch (error) {
      console.warn('Failed to sign out from Clerk:', error);
    }
  }

  // Redirect to login page with deleted account flag
  const loginUrl = new URL('/login', window.location.origin);
  loginUrl.searchParams.set('deleted', 'true');
  window.location.href = loginUrl.toString();
};
