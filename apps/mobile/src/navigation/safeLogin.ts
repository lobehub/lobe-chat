import { router as globalRouter, type Router } from 'expo-router';
import { isLoginMounted } from './loginState';

export const isOnLoginPath = () => isLoginMounted();

export const safeReplaceLogin = (router?: Pick<Router, 'replace'>) => {
  if (isOnLoginPath()) return false;
  try {
    const r = router ?? globalRouter;
    r.replace('/auth/login');
    return true;
  } catch {
    return false;
  }
};
