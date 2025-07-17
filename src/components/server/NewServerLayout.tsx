import { FC, ReactNode } from 'react';

import { RouteVariants } from '@/utils/server/routeVariants';

// 让 props 直接包含 Desktop, Mobile 和其他所有子组件/slots
interface ServerLayoutProps {
  Desktop: FC<any>;
  Mobile: FC<any>;
  children: ReactNode;
}

const ServerLayout = async ({ Desktop, Mobile, ...props }: ServerLayoutProps) => {
  // isMobile 的计算逻辑保持不变
  // @ts-expect-error
  const isMobile = await RouteVariants.getIsMobile(props);

  // 直接渲染，将所有 props 传递下去
  if (isMobile) {
    return <Mobile {...props} />;
  }

  return <Desktop {...props} />;
};

ServerLayout.displayName = 'ServerLayout';

export default ServerLayout;
