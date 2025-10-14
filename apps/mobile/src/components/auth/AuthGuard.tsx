import type { ReactNode } from 'react';
import { memo } from 'react';

import { useAuth } from '@/store/user';

interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

const AuthGuard = memo<AuthGuardProps>(({ children, fallback }) => {
  const { isAuthenticated } = useAuth();

  // 未认证时显示fallback或返回null（路由会被重定向）
  if (!isAuthenticated) {
    return fallback || null;
  }

  // 已认证时显示子组件
  return children;
});

AuthGuard.displayName = 'AuthGuard';

export default AuthGuard;
