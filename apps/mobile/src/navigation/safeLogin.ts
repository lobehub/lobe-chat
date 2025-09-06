import { router as globalRouter } from 'expo-router';
import { isLoginMounted } from './loginState';

export const isOnLoginPath = () => isLoginMounted();

export const safeReplaceLogin = (router?: { replace: (path: string) => void }) => {
  if (isOnLoginPath()) return false;
  try {
    const r = router ?? globalRouter;
    r.replace('/login');
    return true;
  } catch {
    return false;
  }
};
