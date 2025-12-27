import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useSWR from 'swr';

import { globalService } from '@/services/global';
import { useUserStore } from '@/store/user';
import { authSelectors, userProfileSelectors } from '@/store/user/selectors';

/**
 * Hook to check if the current user's email is in the whitelist.
 * If not, redirects to the waitlist page.
 * @returns isChecking - true while the whitelist check is in progress
 */
export const useWhitelistCheck = () => {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);

  const [isLogin, email, isLoaded] = useUserStore((s) => [
    authSelectors.isLogin(s),
    userProfileSelectors.email(s),
    authSelectors.isLoaded(s),
  ]);

  const { data: whitelist, isLoading } = useSWR('whitelist', globalService.getWhitelist, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  console.log('[useWhitelistCheck] whitelist:', whitelist);

  useEffect(() => {
    // Wait for user state to load
    if (!isLoaded) return;

    // If user is not logged in, allow access (no whitelist check needed)
    if (!isLogin) {
      setIsChecking(false);
      return;
    }

    // Wait for whitelist to load
    if (isLoading) return;

    // If whitelist is empty or not configured, allow access
    if (!whitelist || whitelist.length === 0) {
      setIsChecking(false);
      return;
    }

    // Check if user's email is in the whitelist
    const isInWhitelist = whitelist.some(
      (allowedEmail) => allowedEmail.toLowerCase() === email.toLowerCase(),
    );

    if (!isInWhitelist) {
      navigate('/waitlist', { replace: true });
    } else {
      setIsChecking(false);
    }
  }, [isLoaded, isLoading, isLogin, email, whitelist, navigate]);

  return { isChecking };
};
