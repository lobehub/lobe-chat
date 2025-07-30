import React from 'react';
import { useAuth } from '@/store/user';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children, fallback }) => {
  const { isAuthenticated } = useAuth();

  // 未认证时显示fallback或返回null（路由会被重定向）
  if (!isAuthenticated) {
    return fallback || null;
  }

  // 已认证时显示子组件
  return children;
};

export default AuthGuard;
