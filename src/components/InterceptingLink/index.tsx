import Link, { LinkProps } from 'next/link';
import { CSSProperties, ReactNode, memo } from 'react';

import { useInterceptingRoutes } from '@/hooks/useInterceptingRoutes';

interface InterceptingLinkProps extends LinkProps {
  children: ReactNode;
  className?: string;
  disableIntercepting?: boolean;
  style?: CSSProperties;
}

const InterceptingLink = memo<InterceptingLinkProps>(({ href, disableIntercepting, ...rest }) => {
  const router = useInterceptingRoutes();
  return (
    <Link
      href={href}
      onClick={(e) => {
        e.preventDefault();
        router.push(href as any, disableIntercepting);
      }}
      {...rest}
    />
  );
});

export default InterceptingLink;
